import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required").max(100).trim(),
  password: z.string().min(1, "Password is required").max(100),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const listQuerySchema = z.object({
  path: z.string().min(1).optional().default("/"),
  limit: z.coerce.number().min(1).max(1000).optional().default(100),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const downloadQuerySchema = z.object({
  path: z.string().min(1, "Path is required"),
});

export const uploadQuerySchema = z.object({
  path: z.string().min(1).optional().default("/"),
});

export const mkdirBodySchema = z.object({
  path: z.string().min(1, "Path is required").max(500),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ListQueryInput = z.infer<typeof listQuerySchema>;
export type DownloadQueryInput = z.infer<typeof downloadQuerySchema>;
export type UploadQueryInput = z.infer<typeof uploadQuerySchema>;
export type MkdirBodyInput = z.infer<typeof mkdirBodySchema>;
