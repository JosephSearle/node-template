"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConfig = parseConfig;
exports.validateConfig = validateConfig;
const config_schema_1 = require("./config.schema");
/** Parses the environment, or lists every problem. Problems name the variable, never its value. */
function parseConfig(env) {
    const result = config_schema_1.envSchema.safeParse(env);
    if (result.success) {
        return { ok: true, config: result.data };
    }
    return {
        ok: false,
        problems: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    };
}
/**
 * The `@nestjs/config` validate hook. It runs while AppModule is being defined, before Nest can
 * log, so it prints the problems and exits rather than throwing a stack trace.
 */
function validateConfig(env) {
    const result = parseConfig(env);
    if (!result.ok) {
        process.stderr.write(["Invalid configuration:", ...result.problems.map((p) => `  ${p}`)].join("\n") + "\n");
        process.exit(1);
    }
    return result.config;
}
//# sourceMappingURL=validate-config.js.map