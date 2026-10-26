import { Controller, Get, HttpCode, HttpStatus, Res } from "@nestjs/common";
import type { Response } from "express";
import { ReadinessRegistry, type ReadinessReport } from "./readiness.registry";

@Controller()
export class HealthController {
	constructor(private readonly readiness: ReadinessRegistry) {}

	/** Liveness: the process is up and serving. Never checks dependencies, so a slow database can't get the container restarted. */
	@Get("healthz")
	@HttpCode(HttpStatus.OK)
	healthz(): { status: "ok" } {
		return { status: "ok" };
	}

	/** Readiness: every registered check passed and the service isn't shutting down. */
	@Get("readyz")
	async readyz(
		@Res({ passthrough: true }) res: Response,
	): Promise<ReadinessReport> {
		const report = await this.readiness.report();
		res.status(
			report.status === "ok" ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE,
		);
		return report;
	}
}
