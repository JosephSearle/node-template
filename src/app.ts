import type { NestApplicationOptions } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";

/** Builds the app, ready to `listen()`. Separate from main.ts so tests can listen on a free port. */
export async function createApp(
	options: Pick<NestApplicationOptions, "logger"> = {},
): Promise<NestExpressApplication> {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		bufferLogs: true,
		...options,
	});
	// Tests pass their own logger; everything else logs JSON through pino.
	if (options.logger === undefined) {
		app.useLogger(app.get(Logger));
	}
	app.disable("x-powered-by");
	// Runs the drain in ReadinessRegistry on SIGTERM, then closes the server.
	app.enableShutdownHooks();
	return app;
}
