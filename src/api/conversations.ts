import type { ConversationMeta } from '@/types/conversation'
import { blocksToText } from '@/types/conversation'
import { getDb } from '@/db/client'
import { listMessages } from './messages'

const API_URL = 'http://localhost:3001'

interface ConversationRow {
  id: string
  title: string
  subtitle: string
}

const toMeta = (row: ConversationRow): ConversationMeta => ({
  id: row.id,
  title: row.title,
  subtitle: row.subtitle,
})

export async function listConversations(): Promise<ConversationMeta[]> {
  const db = await getDb()
  const result = await db.query<ConversationRow>(
    `SELECT id, title, subtitle FROM conversations ORDER BY updated_at DESC`,
  )
  return result.rows.map(toMeta)
}

export async function createConversation(): Promise<ConversationMeta> {
  const db = await getDb()
  const id = crypto.randomUUID()
  const result = await db.query<ConversationRow>(
    `INSERT INTO conversations (id, title) VALUES ($1, $2)
     RETURNING id, title, subtitle`,
    [id, 'New chat'],
  )
  const row = result.rows[0]
  if (!row) throw new Error('Failed to create conversation')
  return toMeta(row)
}

export async function renameConversation(id: string, title: string): Promise<void> {
  const db = await getDb()
  await db.query(
    `UPDATE conversations SET title = $1, updated_at = NOW() WHERE id = $2`,
    [title, id],
  )
}

export async function touchConversation(id: string): Promise<void> {
  const db = await getDb()
  await db.query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [id])
}

export async function deleteConversation(id: string): Promise<void> {
  const db = await getDb()
  await db.query(`DELETE FROM conversations WHERE id = $1`, [id])
}

export async function generateTitle(conversationId: string): Promise<string> {
  const messages = await listMessages(conversationId)
  const chatMessages = messages.map(m => ({
    role: m.role,
    content: blocksToText(m.blocks),
  }))

  const res = await fetch(`${API_URL}/api/title`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: chatMessages }),
  })

  if (!res.ok) throw new Error('Title generation failed')
  const data = await res.json() as { title: string }
  return data.title
}
