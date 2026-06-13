"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const queue_schema_1 = require("./queue.schema");
const token_schema_1 = require("../token/token.schema");
const queue_service_1 = require("./queue.service");
const queue_controller_1 = require("./queue.controller");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: queue_schema_1.QueueEntity.name, schema: queue_schema_1.QueueSchema },
                { name: token_schema_1.TokenEntity.name, schema: token_schema_1.TokenSchema },
            ]),
        ],
        controllers: [queue_controller_1.QueueController],
        providers: [queue_service_1.QueueService],
        exports: [queue_service_1.QueueService],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map