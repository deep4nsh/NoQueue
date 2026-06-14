"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const mongoose_1 = require("@nestjs/mongoose");
const business_module_1 = require("./modules/business/business.module");
const branch_module_1 = require("./modules/branch/branch.module");
const queue_module_1 = require("./modules/queue/queue.module");
const service_module_1 = require("./modules/service/service.module");
const token_module_1 = require("./modules/token/token.module");
const user_module_1 = require("./modules/user/user.module");
const auth_module_1 = require("./modules/auth/auth.module");
const notification_module_1 = require("./modules/notification/notification.module");
const jwt_auth_guard_1 = require("./modules/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("./modules/auth/guards/roles.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (cfg) => ({
                    uri: cfg.get('MONGODB_URI') ?? 'mongodb://localhost:27017/noqueue',
                }),
                inject: [config_1.ConfigService],
            }),
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            business_module_1.BusinessModule,
            branch_module_1.BranchModule,
            queue_module_1.QueueModule,
            service_module_1.ServiceModule,
            token_module_1.TokenModule,
            notification_module_1.NotificationModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map