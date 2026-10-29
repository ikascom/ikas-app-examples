import { z } from 'zod';

// Validation helper functions
export function validateRequest<T>(schema: z.ZodType<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.issues.map((e) => e.message).join(', '),
  };
}
