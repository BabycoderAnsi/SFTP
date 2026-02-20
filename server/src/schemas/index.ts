import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required").max(100).trim(),
  password: z.string().min(1, "Password is required").max(100),
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string()
    .email("Invalid email address")
    .max(255),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(passwordRegex, "Password must contain uppercase, lowercase, number, and special character"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "DISABLED"]),
});

export const updateRoleSchema = z.object({
  role: z.enum(["READ_ONLY", "READ_WRITE", "ADMIN"]),
});

export const listUsersQuerySchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "DISABLED"]).optional(),
  role: z.enum(["READ_ONLY", "READ_WRITE", "ADMIN"]).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
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
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type ListUsersQueryInput = z.infer<typeof listUsersQuerySchema>;
export type ListQueryInput = z.infer<typeof listQuerySchema>;
export type DownloadQueryInput = z.infer<typeof downloadQuerySchema>;
export type UploadQueryInput = z.infer<typeof uploadQuerySchema>;
export type MkdirBodyInput = z.infer<typeof mkdirBodySchema>;
