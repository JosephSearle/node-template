import { BeforeApplicationShutdown, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AppConfig } from "../config/config.schema";

/** Resolves when the dependency is usable, rejects or throws when it isn't. */
export type ReadinessCheck = () => Promise<void> | void;

export type CheckStatus = "ok" | "error" | "timeout";

export interface ReadinessReport {
	status: "ok" | "unavailable";
	checks: Record<string, CheckStatus>;
}

const CHECK_TIMEOUT_MS = 2_000;

/**
 * Checks /readyz runs. Register one per dependency the service can't serve without, e.g. in a
 * module's onModuleInit: `this.readiness.register("database", () => this.db.ping())`.
 */
@Injectable()
export class ReadinessRegistry implements BeforeApplicationShutdown {
	private readonly logger = new Logger(ReadinessRegistry.name);
	private readonly checks = new Map<string, ReadinessCheck>();
	private draining = false;

	constructor(private readonly config: ConfigService<AppConfig, true>) {}

	register(name: string, check: ReadinessCheck): void {
		if (this.checks.has(name)) {
			throw new Error(`Readiness check "${name}" is already registered.`);
		}
		this.checks.set(name, check);
	}

	async report(): Promise<ReadinessReport> {
		const entries = await Promise.all(
			[...this.checks].map(
				async ([name, check]) => [name, await this.run(name, check)] as const,
			),
		);
		const checks = Object.fromEntries(entries);
		const healthy = !this.draining && entries.every(([, s]) => s === "ok");
		return { status: healthy ? "ok" : "unavailable", checks };
	}

	/** Fails readiness, then waits so the platform stops routing here before the server closes. */
	async beforeApplicationShutdown(): Promise<void> {
		this.draining = true;
		const drainMs = this.config.get("SHUTDOWN_DRAIN_MS", { infer: true });
		if (drainMs > 0) {
			this.logger.log(`Draining for ${drainMs} ms before shutdown`);
			await new Promise((resolve) => setTimeout(resolve, drainMs));
		}
	}

	private async run(name: string, check: ReadinessCheck): Promise<CheckStatus> {
		let timer: NodeJS.Timeout | undefined;
		const timeout = new Promise<"timeout">((resolve) => {
			timer = setTimeout(() => resolve("timeout"), CHECK_TIMEOUT_MS);
		});
		try {
			const outcome = await Promise.race([
				Promise.resolve()
					.then(check)
					.then(() => "ok" as const),
				timeout,
			]);
			if (outcome === "timeout") {
				this.logger.warn(`Readiness check "${name}" timed out`);
			}
			return outcome;
		} catch (error) {
			// Logged, not returned: error messages can name internal hosts.
			this.logger.warn(`Readiness check "${name}" failed: ${String(error)}`);
			return "error";
		} finally {
			clearTimeout(timer);
		}
	}
}
