import { z } from 'zod'
import { ExposureRating } from '@prisma/client'

export const evaluationSchema = z.object({
  studentId: z
    .string()
    .min(1, 'Student ID is required')
    .max(20, 'Student ID must be 20 characters or fewer'),

  positioningScore: z
    .number({ invalid_type_error: 'Score must be a number' })
    .int('Score must be a whole number')
    .min(1, 'Minimum score is 1')
    .max(10, 'Maximum score is 10'),

  exposureRating: z.nativeEnum(ExposureRating, {
    errorMap: () => ({ message: 'Select a valid exposure rating' }),
  }),

  clinicalFeedback: z
    .string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(2000, 'Feedback must not exceed 2000 characters'),
})

export type EvaluationInput = z.infer<typeof evaluationSchema>
