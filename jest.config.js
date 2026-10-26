/** @type {import('jest').Config} */
module.exports = {
	testEnvironment: "node",
	roots: ["<rootDir>/test"],
	testRegex: ".*\\.spec\\.ts$",
	// Config is read when AppModule is imported, so the environment is set before any test file loads.
	setupFiles: ["<rootDir>/test/setup-env.ts"],
	// Nest 12 is ESM-only, so tests run as ES modules (see the `test` script).
	extensionsToTreatAsEsm: [".ts"],
	transform: {
		"^.+\\.ts$": [
			"ts-jest",
			{
				useESM: true,
				tsconfig: { module: "esnext", moduleResolution: "bundler" },
			},
		],
	},
};
