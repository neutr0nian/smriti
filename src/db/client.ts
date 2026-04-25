import { PGlite } from '@electric-sql/pglite'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS conversations (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  subtitle    TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user','assistant')),
  blocks          JSONB NOT NULL,
  versions        JSONB,
  version_index   INTEGER,
  position        INTEGER NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages(conversation_id, position);

CREATE TABLE IF NOT EXISTS notes (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id      TEXT REFERENCES messages(id) ON DELETE CASCADE,
  kind            TEXT NOT NULL CHECK (kind IN ('inline','sticky','scribble')),
  text            TEXT NOT NULL DEFAULT '',
  x               INTEGER,
  y               INTEGER,
  w               INTEGER,
  rot             REAL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_conversation
  ON notes(conversation_id);
`

let dbPromise: Promise<PGlite> | null = null

export function getDb(): Promise<PGlite> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = new PGlite('idb://rancho')
      await db.exec(SCHEMA)
      return db
    })()
  }
  return dbPromise
}
