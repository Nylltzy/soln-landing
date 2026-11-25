import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'

// The Worker in front of the static site. Add API routes here; everything
// else falls through to the built assets (single-page-application mode).
type Env = {
  ASSETS: Fetcher
  DB: D1Database
}

const app = new Hono<{ Bindings: Env }>()

app.use('/api/*', bodyLimit({ maxSize: 16 * 1024, onError: (c) => c.json({ error: 'Request is too large.' }, 413) }))

app.get('/api/health', (c) => c.json({ ok: true }))

// Created once per Worker isolate, on first signup, so the table exists
// whether or not the database was provisioned with a migration.
let schemaReady: Promise<void> | null = null

function ensureSchema(db: D1Database) {
  if (!schemaReady) {
    schemaReady = db
      .prepare('CREATE TABLE IF NOT EXISTS subscribers (email TEXT PRIMARY KEY, created_at TEXT NOT NULL)')
      .run()
      .then(() => undefined)
      .catch((error: unknown) => {
        schemaReady = null
        throw error
      })
  }
  return schemaReady
}

// Waitlist capture. Addresses are stored in the D1 database bound as DB;
// submitting the same address twice is a no-op rather than an error.
app.post('/api/subscribe', async (c) => {
  const body = await c.req.json<{ email?: unknown }>().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'Enter a valid email address.' }, 400)
  }

  const db = c.env.DB
  if (!db) {
    return c.json({ error: 'Signups are not configured.' }, 503)
  }

  try {
    await ensureSchema(db)
    const result = await db
      .prepare('INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, ?)')
      .bind(email, new Date().toISOString())
      .run()
    const saved = (result.meta?.changes ?? 0) > 0
    return c.json({ ok: true, alreadySubscribed: !saved })
  } catch (error) {
    console.error('subscribe failed', error)
    return c.json({ error: 'Could not save your address. Please try again.' }, 500)
  }
})

app.all('/api/*', (c) => c.json({ error: 'Not found.' }, 404))

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
