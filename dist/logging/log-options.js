"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logOptions = logOptions;
const node_crypto_1 = require("node:crypto");
const PROBE_PATHS = new Set(["/healthz", "/readyz"]);
const REQUEST_ID = /^[\w-]{1,128}$/;
/** JSON logs with a request ID per request. Probe requests aren't logged, to keep the noise down. */
function logOptions(level) {
    return {
        pinoHttp: {
            level,
            // Reuse the caller's x-request-id when it looks safe, so logs join up across services.
            genReqId: (req, res) => {
                const incoming = req.headers["x-request-id"];
                const id = typeof incoming === "string" && REQUEST_ID.test(incoming)
                    ? incoming
                    : (0, node_crypto_1.randomUUID)();
                res.setHeader("x-request-id", id);
                return id;
            },
            autoLogging: {
                ignore: (req) => PROBE_PATHS.has(req.url?.split("?")[0] ?? ""),
            },
            redact: ["req.headers.authorization", "req.headers.cookie"],
        },
    };
}
//# sourceMappingURL=log-options.js.map