import { z } from 'zod'

export const evaluationSchema = z.object({
  studentId: z
    .string()
    .min(1, 'Student ID is required')
    .max(20, 'Student ID must be 20 characters or fewer'),

  positioningScore: z.number().int().min(1).max(10).optional(),
  exposureRating: z.string().optional(),
  clinicalFeedback: z.string().max(2000).optional(),
}).passthrough()

export type EvaluationInput = z.infer<typeof evaluationSchema>
