"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_1 = require("./app");
async function bootstrap() {
    const app = await (0, app_1.createApp)();
    const port = app
        .get(config_1.ConfigService)
        .get("PORT", { infer: true });
    await app.listen(port, "0.0.0.0");
}
bootstrap().catch((error) => {
    new common_1.Logger("Bootstrap").error(error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map