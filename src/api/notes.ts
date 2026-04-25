import type { InlineNote } from '@/types/conversation'
import type { FloatingNote } from '@/types/notes'
import { getDb } from '@/db/client'

interface InlineNoteRow {
  id: string
  message_id: string
  text: string
}

interface FloatingNoteRow {
  id: string
  conversation_id: string
  kind: 'sticky' | 'scribble'
  x: number
  y: number
  w: number
  h: number | null
  rot: number
  text: string
}

export async function listInlineNotes(conversationId: string): Promise<InlineNote[]> {
  const db = await getDb()
  const result = await db.query<InlineNoteRow>(
    `SELECT id, message_id, text FROM notes
     WHERE conversation_id = $1 AND kind = 'inline'`,
    [conversationId],
  )
  return result.rows.map(r => ({ id: r.id, messageId: r.message_id, text: r.text }))
}

export async function setInlineNote(
  conversationId: string,
  messageId: string,
  text: string,
): Promise<void> {
  const db = await getDb()
  const id = `inline-${messageId}`
  await db.query(
    `INSERT INTO notes (id, conversation_id, message_id, kind, text)
     VALUES ($1, $2, $3, 'inline', $4)
     ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text`,
    [id, conversationId, messageId, text],
  )
}

export async function removeInlineNote(messageId: string): Promise<void> {
  const db = await getDb()
  await db.query(`DELETE FROM notes WHERE message_id = $1 AND kind = 'inline'`, [messageId])
}

export async function listFloatingNotes(conversationId: string): Promise<FloatingNote[]> {
  const db = await getDb()
  const result = await db.query<FloatingNoteRow>(
    `SELECT id, conversation_id, kind, x, y, w, h, rot, text FROM notes
     WHERE conversation_id = $1 AND kind IN ('sticky','scribble')`,
    [conversationId],
  )
  return result.rows.map(r => ({
    id: r.id,
    conversationId: r.conversation_id,
    kind: r.kind,
    x: r.x,
    y: r.y,
    w: r.w,
    h: r.h ?? undefined,
    rot: r.rot,
    text: r.text,
  }))
}

export async function addFloatingNote(note: FloatingNote): Promise<void> {
  const db = await getDb()
  await db.query(
    `INSERT INTO notes (id, conversation_id, kind, text, x, y, w, h, rot)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [note.id, note.conversationId, note.kind, note.text, note.x, note.y, note.w, note.h ?? null, note.rot],
  )
}

export async function resizeFloatingNote(id: string, w: number, h: number): Promise<void> {
  const db = await getDb()
  await db.query(`UPDATE notes SET w = $1, h = $2 WHERE id = $3`, [w, h, id])
}

export async function moveFloatingNote(id: string, x: number, y: number): Promise<void> {
  const db = await getDb()
  await db.query(`UPDATE notes SET x = $1, y = $2 WHERE id = $3`, [x, y, id])
}

export async function updateFloatingNote(id: string, text: string): Promise<void> {
  const db = await getDb()
  await db.query(`UPDATE notes SET text = $1 WHERE id = $2`, [text, id])
}

export async function deleteFloatingNote(id: string): Promise<void> {
  const db = await getDb()
  await db.query(`DELETE FROM notes WHERE id = $1`, [id])
}
