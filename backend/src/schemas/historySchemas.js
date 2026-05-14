import { z } from 'zod';

export const recordPlaySchema = z.object({
  songId: z.coerce.number().int().positive(),
  duration: z.coerce.number().nonnegative(),
  device: z.string().max(50).default('web'),
});
