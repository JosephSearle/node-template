"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const core_1 = require("@nestjs/core");
const nestjs_pino_1 = require("nestjs-pino");
const app_module_1 = require("./app.module");
/** Builds the app, ready to `listen()`. Separate from main.ts so tests can listen on a free port. */
async function createApp(options = {}) {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
        ...options,
    });
    // Tests pass their own logger; everything else logs JSON through pino.
    if (options.logger === undefined) {
        app.useLogger(app.get(nestjs_pino_1.Logger));
    }
    app.disable("x-powered-by");
    // Runs the drain in ReadinessRegistry on SIGTERM, then closes the server.
    app.enableShutdownHooks();
    return app;
}
//# sourceMappingURL=app.js.map