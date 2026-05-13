import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreatePortalUser } from '@/lib/auth-user'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getOrCreatePortalUser(userId)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const evaluation = await prisma.evaluation.findUnique({ where: { id: params.id } })
    if (!evaluation) {
      return Response.json({ error: 'Evaluation not found' }, { status: 404 })
    }

    const body = await request.json()

    const updated = await prisma.evaluation.update({
      where: { id: params.id },
      data: {
        preProcedureData: body as any,
        currentSection: 'final-result',
        status: 'completed',
        completedSections: [
          'maklumat-pesakit',
          'borang-permintaan',
          'persediaan-bilik-dan-peralatan',
          'jagaan-awal-pesakit',
          'prosedur-radiografi',
          'penilaian-radiograf-oleh-pelatih',
          'jagaan-pesakit-semasa-dan-selepas',
          'ulasan-am',
          'penilai-kedua-summary',
          'piawan-imej-oleh-penilai',
          'discussion',
          'final-result',
        ],
      },
    })

    return Response.json({ success: true, id: updated.id })
  } catch (error) {
    console.error('Error updating evaluation:', error)
    return Response.json(
      { error: 'Failed to update evaluation' },
      { status: 500 }
    )
  }
}
