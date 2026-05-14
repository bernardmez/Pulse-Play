import { z } from 'zod';

export const createPlaylistSchema = z.object({
  title: z.string().min(1).max(255).trim(),
  description: z.string().max(1000).trim().optional(),
  isPublic: z.boolean().default(true),
});

export const addSongSchema = z.object({
  songId: z.coerce.number().int().positive(),
});
