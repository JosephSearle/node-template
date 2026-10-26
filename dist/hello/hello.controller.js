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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloController = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const hello_service_1 = require("./hello.service");
const helloQuery = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(100).default("world"),
});
/** Example resource. Replace it with your own modules; keep the validate-then-delegate shape. */
let HelloController = class HelloController {
    hello;
    constructor(hello) {
        this.hello = hello;
    }
    get(query) {
        const parsed = helloQuery.safeParse(query);
        if (!parsed.success) {
            throw new common_1.BadRequestException(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
        }
        return { message: this.hello.greet(parsed.data.name) };
    }
};
exports.HelloController = HelloController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], HelloController.prototype, "get", null);
exports.HelloController = HelloController = __decorate([
    (0, common_1.Controller)("v1/hello"),
    __metadata("design:paramtypes", [hello_service_1.HelloService])
], HelloController);
//# sourceMappingURL=hello.controller.js.map