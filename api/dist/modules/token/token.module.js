"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const token_schema_1 = require("./token.schema");
const queue_schema_1 = require("../queue/queue.schema");
const service_schema_1 = require("../service/service.schema");
const token_service_1 = require("./token.service");
const token_controller_1 = require("./token.controller");
const gateways_module_1 = require("../../gateways/gateways.module");
let TokenModule = class TokenModule {
};
exports.TokenModule = TokenModule;
exports.TokenModule = TokenModule = __decorate([
    (0, common_1.Module)({
        imports: [
            gateways_module_1.GatewaysModule,
            mongoose_1.MongooseModule.forFeature([
                { name: token_schema_1.TokenEntity.name, schema: token_schema_1.TokenSchema },
                { name: queue_schema_1.QueueEntity.name, schema: queue_schema_1.QueueSchema },
                { name: service_schema_1.ServiceEntity.name, schema: service_schema_1.ServiceSchema },
            ]),
        ],
        controllers: [token_controller_1.TokenController],
        providers: [token_service_1.TokenService],
        exports: [token_service_1.TokenService],
    })
], TokenModule);
//# sourceMappingURL=token.module.js.map