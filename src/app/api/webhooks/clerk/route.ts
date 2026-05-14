import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const WAITLIST_FILE = path.join(process.cwd(), 'data', 'waitlist.json')

function ensureWaitlistFile() {
  const dir = path.dirname(WAITLIST_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(WAITLIST_FILE)) fs.writeFileSync(WAITLIST_FILE, JSON.stringify([]))
}

function verifySignature(req: Request, bodyText: string) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) return true // no verification in local env

  const signature = req.headers.get('clerk-signature') || req.headers.get('Clerk-Signature')
  if (!signature) return false

  const hmac = crypto.createHmac('sha256', secret).update(bodyText).digest('hex')
  return signature === hmac
}

export async function POST(req: Request) {
  try {
    const bodyText = await req.text()
    if (!verifySignature(req, bodyText)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(bodyText)
    const eventType = payload.type || payload.event || payload.data?.type

    ensureWaitlistFile()
    const raw = fs.readFileSync(WAITLIST_FILE, 'utf8')
    const list = JSON.parse(raw || '[]')

    if (eventType === 'waitlist.entry.created' || eventType === 'waitlist.entry:created') {
      const entry = {
        id: payload.data?.id ?? payload.data?.entry?.id ?? (payload.data?.email + '_' + Date.now()),
        email: payload.data?.email ?? payload.data?.entry?.email ?? payload.data?.user?.primary_email_address ?? null,
        name: payload.data?.name ?? payload.data?.entry?.name ?? null,
        message: payload.data?.message ?? null,
        createdAt: new Date().toISOString(),
      }

      // avoid duplicates
      if (!list.find((e: any) => e.email === entry.email)) {
        list.push(entry)
        fs.writeFileSync(WAITLIST_FILE, JSON.stringify(list, null, 2))
      }

      return NextResponse.json({ ok: true })
    }

    // Other event types (user.created) - try to auto-link
    if (eventType === 'user.created' || eventType === 'users.create') {
      const clerkId = payload.data?.id ?? payload.data?.user?.id
      const email = payload.data?.primary_email_address?.emailAddress ?? payload.data?.email ?? payload.data?.user?.primary_email_address?.emailAddress

      // Remove from waitlist if present
      const updated = list.filter((e: any) => e.email !== email)
      if (updated.length !== list.length) {
        fs.writeFileSync(WAITLIST_FILE, JSON.stringify(updated, null, 2))
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 })
  }
}
