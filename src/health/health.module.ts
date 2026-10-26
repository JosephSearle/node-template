import { Global, Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { ReadinessRegistry } from "./readiness.registry";

/** Global, so any module can inject ReadinessRegistry to register its checks. */
@Global()
@Module({
	controllers: [HealthController],
	providers: [ReadinessRegistry],
	exports: [ReadinessRegistry],
})
export class HealthModule {}
