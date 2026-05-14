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

    // Support both new records (assessorId = user.id) and legacy records (assessorId = clerk userId)
    const isOwner = evaluation.assessorId === user.id || evaluation.assessorId === userId
    if (!isOwner) {
      return Response.json({ error: 'Unauthorized - cannot update evaluation' }, { status: 403 })
    }

    const body = await request.json()
    const { data, isPartialSave, section } = body

    // Handle partial saves (section by section)
    if (isPartialSave) {
      const sectionFieldMapping: Record<number, string> = {
        1: 'maklumatPesakit',
        2: 'borangPermintaan',
        3: 'bilikDanPeralatan',
        4: 'jagaanAwal',
        5: 'prosedur',
        6: 'radiograf',
        7: 'selepas',
        8: 'ulasanAm',
        9: 'penilaiKedua',
        10: 'piawanImej',
        11: 'discussion',
        12: 'finalResult',
      }

      const fieldName = sectionFieldMapping[section as number]
      if (!fieldName) {
        return Response.json({ error: 'Invalid section number' }, { status: 400 })
      }

      const updateData: any = {
        [fieldName]: data,
      }

      // Mark this section as completed
      const completedSections = evaluation.completedSections || []
      const sectionNames = [
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
      ]

      const sectionName = sectionNames[section - 1]
      if (sectionName && !completedSections.includes(sectionName)) {
        updateData.completedSections = [...completedSections, sectionName]
      }

      const updated = await prisma.evaluation.update({
        where: { id: params.id },
        data: updateData,
      })

      return Response.json({ success: true, id: updated.id })
    }

    // Handle full form completion
    const updated = await prisma.evaluation.update({
      where: { id: params.id },
      data: {
        preProcedureData: data as any,
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getOrCreatePortalUser(userId)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify evaluation exists and belongs to this user
    const evaluation = await prisma.evaluation.findUnique({ where: { id: params.id } })
    if (!evaluation) {
      return Response.json({ error: 'Evaluation not found' }, { status: 404 })
    }

    // Support both new records (assessorId = user.id) and legacy records (assessorId = clerk userId)
    const isOwner = evaluation.assessorId === user.id || evaluation.assessorId === userId
    if (!isOwner) {
      return Response.json({ error: 'Unauthorized - cannot delete evaluation' }, { status: 403 })
    }

    // Delete the evaluation
    await prisma.evaluation.delete({
      where: { id: params.id },
    })

    return Response.json({ success: true, message: 'Evaluation deleted' })
  } catch (error) {
    console.error('Error deleting evaluation:', error)
    return Response.json(
      { error: 'Failed to delete evaluation' },
      { status: 500 }
    )
  }
}
