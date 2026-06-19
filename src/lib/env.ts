import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CRON_SECRET: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

let cached: Env | null = null

export function validateEnv(): Env {
  if (cached) return cached
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const msg = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
    throw new Error(`Environment validation failed: ${msg}`)
  }
  cached = result.data
  return cached
}
