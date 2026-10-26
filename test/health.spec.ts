import { ReadinessRegistry } from "../src/health/readiness.registry";
import { startTestServer, type TestServer } from "./support";

describe("health endpoints", () => {
	let server: TestServer;

	beforeEach(async () => {
		server = await startTestServer();
	});

	afterEach(async () => {
		await server.app.close();
	});

	it("GET /healthz returns 200", async () => {
		const res = await fetch(server.url("/healthz"));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ status: "ok" });
	});

	it("GET /readyz returns 200 when there are no checks", async () => {
		const res = await fetch(server.url("/readyz"));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ status: "ok", checks: {} });
	});

	it("GET /readyz returns 200 when every check passes", async () => {
		server.app.get(ReadinessRegistry).register("cache", async () => {});
		const res = await fetch(server.url("/readyz"));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ status: "ok", checks: { cache: "ok" } });
	});

	it("GET /readyz returns 503 and hides the error when a check fails", async () => {
		const registry = server.app.get(ReadinessRegistry);
		registry.register("cache", async () => {});
		registry.register("database", () => {
			throw new Error("connect ECONNREFUSED db.internal:5432");
		});
		const res = await fetch(server.url("/readyz"));
		expect(res.status).toBe(503);
		const body = await res.text();
		expect(JSON.parse(body)).toEqual({
			status: "unavailable",
			checks: { cache: "ok", database: "error" },
		});
		expect(body).not.toContain("db.internal");
	});

	it("GET /readyz returns 503 once shutdown starts, while /healthz stays 200", async () => {
		await server.app.get(ReadinessRegistry).beforeApplicationShutdown();
		expect((await fetch(server.url("/readyz"))).status).toBe(503);
		expect((await fetch(server.url("/healthz"))).status).toBe(200);
	});

	it("rejects registering the same check twice", () => {
		const registry = server.app.get(ReadinessRegistry);
		registry.register("database", () => {});
		expect(() => registry.register("database", () => {})).toThrow(
			/already registered/,
		);
	});

	it("echoes a safe x-request-id and replaces an unsafe one", async () => {
		const kept = await fetch(server.url("/healthz"), {
			headers: { "x-request-id": "abc-123" },
		});
		expect(kept.headers.get("x-request-id")).toBe("abc-123");
		const replaced = await fetch(server.url("/healthz"), {
			headers: { "x-request-id": "bad id\twith spaces" },
		});
		expect(replaced.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
	});
});
