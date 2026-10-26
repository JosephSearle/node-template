import { parseConfig } from "../src/config/validate-config";

describe("parseConfig", () => {
	it("applies defaults to an empty environment", () => {
		expect(parseConfig({})).toEqual({
			ok: true,
			config: {
				NODE_ENV: "development",
				PORT: 8080,
				LOG_LEVEL: "info",
				SHUTDOWN_DRAIN_MS: 0,
			},
		});
	});

	it("lists every problem by variable name, without values", () => {
		const result = parseConfig({ PORT: "not-a-port", LOG_LEVEL: "loud" });
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.problems).toHaveLength(2);
		expect(result.problems[0]).toMatch(/^PORT: /);
		expect(result.problems[1]).toMatch(/^LOG_LEVEL: /);
		expect(result.problems.join("\n")).not.toContain("loud");
	});
});
