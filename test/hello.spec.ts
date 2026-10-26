import { HelloService } from "../src/hello/hello.service";
import { startTestServer, type TestServer } from "./support";

describe("HelloService", () => {
	it("greets by name", () => {
		expect(new HelloService().greet("Ada")).toBe("Hello, Ada!");
	});
});

describe("GET /v1/hello", () => {
	let server: TestServer;

	beforeAll(async () => {
		server = await startTestServer();
	});

	afterAll(async () => {
		await server.app.close();
	});

	it("greets the world by default", async () => {
		const res = await fetch(server.url("/v1/hello"));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ message: "Hello, world!" });
	});

	it("greets the given name", async () => {
		const res = await fetch(server.url("/v1/hello?name=Ada"));
		expect(await res.json()).toEqual({ message: "Hello, Ada!" });
	});

	it("returns 400 for a name that is too long", async () => {
		const res = await fetch(server.url(`/v1/hello?name=${"a".repeat(101)}`));
		expect(res.status).toBe(400);
	});
});
