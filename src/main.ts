import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createApp } from "./app";
import type { AppConfig } from "./config/config.schema";

async function bootstrap(): Promise<void> {
	const app = await createApp();
	const port = app
		.get<ConfigService<AppConfig, true>>(ConfigService)
		.get("PORT", { infer: true });
	await app.listen(port, "0.0.0.0");
}

bootstrap().catch((error: unknown) => {
	new Logger("Bootstrap").error(error);
	process.exit(1);
});
