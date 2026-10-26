import { type AppConfig, envSchema } from "./config.schema";

export type ConfigResult =
	| { ok: true; config: AppConfig }
	| { ok: false; problems: string[] };

/** Parses the environment, or lists every problem. Problems name the variable, never its value. */
export function parseConfig(env: Record<string, unknown>): ConfigResult {
	const result = envSchema.safeParse(env);
	if (result.success) {
		return { ok: true, config: result.data };
	}
	return {
		ok: false,
		problems: result.error.issues.map(
			(issue) => `${issue.path.join(".")}: ${issue.message}`,
		),
	};
}

/**
 * The `@nestjs/config` validate hook. It runs while AppModule is being defined, before Nest can
 * log, so it prints the problems and exits rather than throwing a stack trace.
 */
export function validateConfig(env: Record<string, unknown>): AppConfig {
	const result = parseConfig(env);
	if (!result.ok) {
		const lines = result.problems.map((p) => `  ${p}`).join("\n");
		process.stderr.write(`Invalid configuration:\n${lines}\n`);
		process.exit(1);
	}
	return result.config;
}
