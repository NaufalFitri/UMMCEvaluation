import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json(
      { error: 'Manual evaluation creation is disabled. Start from an assigned schedule.' },
      { status: 403 }
    )
  } catch (error) {
    console.error('Error creating evaluation:', error)
    return Response.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    )
  }
}
