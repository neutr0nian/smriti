import type { MessageData, MessageBlock } from '@/types/conversation'
import { getDb } from '@/db/client'

interface MessageRow {
  id: string
  role: 'user' | 'assistant'
  blocks: MessageBlock[]
  versions: MessageBlock[][] | null
  version_index: number | null
  position: number
}

const toMessage = (row: MessageRow): MessageData => ({
  id: row.id,
  role: row.role,
  blocks: row.blocks,
  versions: row.versions ?? undefined,
  versionIndex: row.version_index ?? undefined,
})

export async function listMessages(conversationId: string): Promise<MessageData[]> {
  const db = await getDb()
  const result = await db.query<MessageRow>(
    `SELECT id, role, blocks, versions, version_index, position
     FROM messages WHERE conversation_id = $1 ORDER BY position ASC`,
    [conversationId],
  )
  return result.rows.map(toMessage)
}

async function nextPosition(conversationId: string): Promise<number> {
  const db = await getDb()
  const result = await db.query<{ next: number }>(
    `SELECT COALESCE(MAX(position), -1) + 1 AS next FROM messages WHERE conversation_id = $1`,
    [conversationId],
  )
  return result.rows[0]?.next ?? 0
}

export async function appendMessage(
  conversationId: string,
  message: MessageData,
): Promise<void> {
  const db = await getDb()
  const position = await nextPosition(conversationId)

  await db.query(
    `INSERT INTO messages (id, conversation_id, role, blocks, versions, version_index, position)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      message.id,
      conversationId,
      message.role,
      JSON.stringify(message.blocks),
      message.versions ? JSON.stringify(message.versions) : null,
      message.versionIndex ?? null,
      position,
    ],
  )
}

export async function upsertAssistantMessage(
  conversationId: string,
  message: MessageData,
): Promise<void> {
  const db = await getDb()
  const position = await nextPosition(conversationId)

  await db.query(
    `INSERT INTO messages (id, conversation_id, role, blocks, versions, version_index, position)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO UPDATE
     SET blocks = EXCLUDED.blocks,
         versions = EXCLUDED.versions,
         version_index = EXCLUDED.version_index`,
    [
      message.id,
      conversationId,
      message.role,
      JSON.stringify(message.blocks),
      message.versions ? JSON.stringify(message.versions) : null,
      message.versionIndex ?? null,
      position,
    ],
  )
}

export async function updateMessageBlocks(id: string, blocks: MessageBlock[]): Promise<void> {
  const db = await getDb()
  await db.query(
    `UPDATE messages SET blocks = $1 WHERE id = $2`,
    [JSON.stringify(blocks), id],
  )
}

export async function updateMessageVersions(
  id: string,
  blocks: MessageBlock[],
  versions: MessageBlock[][],
  versionIndex: number,
): Promise<void> {
  const db = await getDb()
  await db.query(
    `UPDATE messages SET blocks = $1, versions = $2, version_index = $3 WHERE id = $4`,
    [JSON.stringify(blocks), JSON.stringify(versions), versionIndex, id],
  )
}

export async function deleteMessagesAfter(
  conversationId: string,
  position: number,
): Promise<void> {
  const db = await getDb()
  await db.query(
    `DELETE FROM messages WHERE conversation_id = $1 AND position > $2`,
    [conversationId, position],
  )
}
