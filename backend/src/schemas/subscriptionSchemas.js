import { z } from 'zod';

export const updateSubscriptionSchema = z.object({
  plan: z.enum(['free', 'premium', 'family']),
  months: z.coerce.number().int().min(1).max(12).default(1),
});
