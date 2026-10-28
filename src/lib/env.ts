import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1).optional().or(z.literal("")),
  DIRECT_URL: z.string().min(1).optional().or(z.literal("")),
  AUTH_SECRET: z.string().min(16).optional().or(z.literal("")),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

/** تحقق كسول من متغيرات البيئة (لا يُستدعى وقت البناء). */
export function getEnv(): Env {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      const keys = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
      throw new Error(`Invalid environment variables: ${keys}`);
    }
    cached = parsed.data;
  }
  return cached;
}
