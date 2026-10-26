"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ReadinessRegistry_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadinessRegistry = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const CHECK_TIMEOUT_MS = 2_000;
/**
 * Checks /readyz runs. Register one per dependency the service can't serve without, e.g. in a
 * module's onModuleInit: `this.readiness.register("database", () => this.db.ping())`.
 */
let ReadinessRegistry = ReadinessRegistry_1 = class ReadinessRegistry {
    config;
    logger = new common_1.Logger(ReadinessRegistry_1.name);
    checks = new Map();
    draining = false;
    constructor(config) {
        this.config = config;
    }
    register(name, check) {
        if (this.checks.has(name)) {
            throw new Error(`Readiness check "${name}" is already registered.`);
        }
        this.checks.set(name, check);
    }
    async report() {
        const entries = await Promise.all([...this.checks].map(async ([name, check]) => [name, await this.run(name, check)]));
        const checks = Object.fromEntries(entries);
        const healthy = !this.draining && entries.every(([, s]) => s === "ok");
        return { status: healthy ? "ok" : "unavailable", checks };
    }
    /** Fails readiness, then waits so the platform stops routing here before the server closes. */
    async beforeApplicationShutdown() {
        this.draining = true;
        const drainMs = this.config.get("SHUTDOWN_DRAIN_MS", { infer: true });
        if (drainMs > 0) {
            this.logger.log(`Draining for ${drainMs} ms before shutdown`);
            await new Promise((resolve) => setTimeout(resolve, drainMs));
        }
    }
    async run(name, check) {
        let timer;
        const timeout = new Promise((resolve) => {
            timer = setTimeout(() => resolve("timeout"), CHECK_TIMEOUT_MS);
        });
        try {
            const outcome = await Promise.race([
                Promise.resolve()
                    .then(check)
                    .then(() => "ok"),
                timeout,
            ]);
            if (outcome === "timeout") {
                this.logger.warn(`Readiness check "${name}" timed out`);
            }
            return outcome;
        }
        catch (error) {
            // Logged, not returned: error messages can name internal hosts.
            this.logger.warn(`Readiness check "${name}" failed: ${String(error)}`);
            return "error";
        }
        finally {
            clearTimeout(timer);
        }
    }
};
exports.ReadinessRegistry = ReadinessRegistry;
exports.ReadinessRegistry = ReadinessRegistry = ReadinessRegistry_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ReadinessRegistry);
//# sourceMappingURL=readiness.registry.js.map