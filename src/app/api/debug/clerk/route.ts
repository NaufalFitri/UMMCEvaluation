import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: Request) {
  try {
    const env = {
      hasPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      hasSecret: !!process.env.CLERK_SECRET_KEY,
    }

    let userId = null
    try {
      const a = auth()
      userId = a?.userId ?? null
    } catch (e) {
      // auth() may throw if misconfigured; capture message
      return NextResponse.json({ ok: false, env, authError: String(e) }, { status: 200 })
    }

    return NextResponse.json({ ok: true, env, userId }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
