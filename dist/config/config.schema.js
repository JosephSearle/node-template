"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
/** Every environment variable the service reads. Add new ones here so startup validates them. */
exports.envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: zod_1.z.coerce.number().int().min(1).max(65535).default(8080),
    LOG_LEVEL: zod_1.z
        .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
        .default("info"),
    SHUTDOWN_DRAIN_MS: zod_1.z.coerce.number().int().min(0).max(60_000).default(0),
});
//# sourceMappingURL=config.schema.js.map