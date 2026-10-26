import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import type { AppConfig } from "./config/config.schema";
import { validateConfig } from "./config/validate-config";
import { HealthModule } from "./health/health.module";
import { HelloModule } from "./hello/hello.module";
import { logOptions } from "./logging/log-options";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, validate: validateConfig }),
		LoggerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService<AppConfig, true>) =>
				logOptions(config.get("LOG_LEVEL", { infer: true })),
		}),
		HealthModule,
		HelloModule,
	],
})
export class AppModule {}
