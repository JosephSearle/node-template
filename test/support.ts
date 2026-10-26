import type { NestExpressApplication } from "@nestjs/platform-express";
import { createApp } from "../src/app";

export interface TestServer {
	app: NestExpressApplication;
	url: (path: string) => string;
}

/** Starts the real app on a free port, with Nest's own logs silenced. */
export async function startTestServer(): Promise<TestServer> {
	const app = await createApp({ logger: false });
	await app.listen(0, "127.0.0.1");
	const address = app.getHttpServer().address();
	if (address === null || typeof address === "string") {
		throw new Error("Expected a TCP address");
	}
	return { app, url: (path) => `http://127.0.0.1:${address.port}${path}` };
}
