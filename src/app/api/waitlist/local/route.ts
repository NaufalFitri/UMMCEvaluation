import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WAITLIST_FILE = path.join(process.cwd(), 'data', 'waitlist.json')

function ensureFile() {
  const dir = path.dirname(WAITLIST_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(WAITLIST_FILE)) fs.writeFileSync(WAITLIST_FILE, JSON.stringify([]))
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, name } = body
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    ensureFile()
    const raw = fs.readFileSync(WAITLIST_FILE, 'utf8')
    const list = JSON.parse(raw || '[]')

    if (list.find((e: any) => e.email === email)) {
      return NextResponse.json({ ok: true })
    }

    list.push({ id: `${email}_${Date.now()}`, email, name: name || null, createdAt: new Date().toISOString() })
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(list, null, 2))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('waitlist local error', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
