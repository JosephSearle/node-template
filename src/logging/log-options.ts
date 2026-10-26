import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Params } from "nestjs-pino";
import type { AppConfig } from "../config/config.schema";

const PROBE_PATHS = new Set(["/healthz", "/readyz"]);
const REQUEST_ID = /^[\w-]{1,128}$/;

/** JSON logs with a request ID per request. Probe requests aren't logged, to keep the noise down. */
export function logOptions(level: AppConfig["LOG_LEVEL"]): Params {
	return {
		pinoHttp: {
			level,
			// Reuse the caller's x-request-id when it looks safe, so logs join up across services.
			genReqId: (req: IncomingMessage, res: ServerResponse) => {
				const incoming = req.headers["x-request-id"];
				const id =
					typeof incoming === "string" && REQUEST_ID.test(incoming)
						? incoming
						: randomUUID();
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
