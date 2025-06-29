import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters"),

  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

  codeforcesHandle: z
    .string()
    .min(3, "Codeforces handle must be at least 3 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Handle can only include letters, numbers, underscores, or hyphens"),

  notifiedContests: z.array(z.number()).optional() ,

  mutuals: z.array(z.string()).optional()
});


export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
