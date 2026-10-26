import { z } from "zod";

/** Every environment variable the service reads. Add new ones here so startup validates them. */
export const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	PORT: z.coerce.number().int().min(1).max(65535).default(8080),
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
		.default("info"),
	SHUTDOWN_DRAIN_MS: z.coerce.number().int().min(0).max(60_000).default(0),
});

export type AppConfig = z.infer<typeof envSchema>;
