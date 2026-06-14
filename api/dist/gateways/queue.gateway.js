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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let QueueGateway = class QueueGateway {
    afterInit(server) {
        console.log('WebSocket Server initialized');
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
    }
    emitTokenJoined(queueId, token) {
        this.server.emit(`queue:${queueId}:token-joined`, token);
    }
    emitQueueRefresh(queueId) {
        this.server.emit(`queue:${queueId}:refresh`);
    }
    emitTokenCalled(queueId, data) {
        this.server.emit(`queue:${queueId}:token-called`, data);
    }
    emitTokenCompleted(queueId, tokenId) {
        this.server.emit(`queue:${queueId}:token-completed`, { tokenId });
    }
    emitTokenSkipped(queueId, tokenId) {
        this.server.emit(`queue:${queueId}:token-skipped`, { tokenId });
    }
    emitTokenCancelled(queueId, tokenId) {
        this.server.emit(`queue:${queueId}:token-cancelled`, { tokenId });
    }
};
exports.QueueGateway = QueueGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], QueueGateway.prototype, "server", void 0);
exports.QueueGateway = QueueGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], QueueGateway);
//# sourceMappingURL=queue.gateway.js.map