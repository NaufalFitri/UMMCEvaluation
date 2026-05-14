import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreatePortalUser } from '@/lib/auth-user'
import { UserRole } from '@prisma/client'

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

function getEditableSectionNumbers(user: { id: string; role: UserRole }, evaluation: { assessorId: string; secondaryAssessorId: string | null }) {
  if (user.role === UserRole.ADMIN) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  if (user.id === evaluation.assessorId) return [1, 2, 3, 4, 5, 6, 7, 8]
  if (user.id === evaluation.secondaryAssessorId) return [9, 10, 11, 12]
  return []
}

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

    const body = await request.json()

    const evaluation = await prisma.evaluation.findUnique({ where: { id: params.id } })
    if (!evaluation) {
      return Response.json({ error: 'Evaluation not found' }, { status: 404 })
    }

    if ('secondaryAssessorId' in body) {
      if (user.role !== UserRole.ADMIN) {
        return Response.json({ error: 'Unauthorized - only admin can assign secondary assessor' }, { status: 403 })
      }

      const secondaryAssessorId = body.secondaryAssessorId as string | null
      if (secondaryAssessorId) {
        const secondaryUser = await prisma.user.findUnique({ where: { id: secondaryAssessorId } })
        const validSecondaryRole =
          secondaryUser && (secondaryUser.role === UserRole.ASSESSOR || secondaryUser.role === UserRole.ADMIN)
        if (!validSecondaryRole) {
          return Response.json({ error: 'Invalid secondary assessor' }, { status: 400 })
        }
      }

      const updated = await prisma.evaluation.update({
        where: { id: params.id },
        data: { secondaryAssessorId },
      })

      return Response.json({ success: true, id: updated.id })
    }

    // Get editable sections for this user based on their role and assigned sections
    const editableSections = getEditableSectionNumbers(user, evaluation)
    if (editableSections.length === 0) {
      return Response.json({ error: 'Unauthorized - cannot edit evaluation sections' }, { status: 403 })
    }

    // Support both new records (assessorId = user.id) and legacy records (assessorId = clerk userId)
    // Ownership check only applies if it's not a section-based edit
    const isOwner = evaluation.assessorId === user.id || evaluation.assessorId === userId
    if (!isOwner && user.role !== UserRole.ADMIN && user.id !== evaluation.secondaryAssessorId) {
      return Response.json({ error: 'Unauthorized - cannot update evaluation' }, { status: 403 })
    }

    const { data, isPartialSave, section } = body

    function mergeAllowedSections(targetData: any, sectionNumbers: number[]) {
      const updateData: any = {}
      for (const sectionNumber of sectionNumbers) {
        const fieldName = sectionFieldMapping[sectionNumber]
        const value = targetData?.[fieldName]
        if (value !== undefined) {
          updateData[fieldName] = value
        }
      }
      return updateData
    }

    // Handle partial saves (section by section)
    if (isPartialSave) {
      const fieldName = sectionFieldMapping[section as number]
      if (!fieldName) {
        return Response.json({ error: 'Invalid section number' }, { status: 400 })
      }

      if (!editableSections.includes(section as number)) {
        return Response.json({ error: 'Unauthorized - section belongs to another assessor' }, { status: 403 })
      }

      const updateData: any = {
        [fieldName]: data,
      }

      // Mark this section as completed
      const completedSections = evaluation.completedSections || []
      const sectionName = sectionNames[section - 1]
      if (sectionName && !completedSections.includes(sectionName)) {
        updateData.completedSections = [...completedSections, sectionName]
      }

      updateData.currentSection = sectionName || evaluation.currentSection

      const updated = await prisma.evaluation.update({
        where: { id: params.id },
        data: updateData,
      })

      return Response.json({ success: true, id: updated.id })
    }

    // Handle full form completion
    const allowedUpdates = mergeAllowedSections(data, editableSections)
    const completedSections = [...new Set([...(evaluation.completedSections || []), ...editableSections.map((sectionNumber) => sectionNames[sectionNumber - 1]).filter(Boolean)])]
    const allSectionsDone = sectionNames.every((name) => completedSections.includes(name))

    const updated = await prisma.evaluation.update({
      where: { id: params.id },
      data: {
        ...allowedUpdates,
        currentSection: sectionNames[Math.max(...editableSections) - 1] || evaluation.currentSection,
        status: allSectionsDone ? 'completed' : evaluation.status,
        completedSections,
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
