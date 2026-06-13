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
exports.QueueGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let QueueGateway = class QueueGateway {
    handleJoinQueue(client, data) {
        client.join(`queue:${data.queueId}`);
        client.emit('joinedQueue', { queueId: data.queueId });
    }
    handleLeaveQueue(client, data) {
        client.leave(`queue:${data.queueId}`);
    }
    emitTokenJoined(queueId, token) {
        this.server.to(`queue:${queueId}`).emit('token:joined', token);
    }
    emitTokenCalled(queueId, payload) {
        this.server.to(`queue:${queueId}`).emit('token:called', payload);
    }
    emitTokenCompleted(queueId, tokenId) {
        this.server.to(`queue:${queueId}`).emit('token:completed', { tokenId });
    }
    emitTokenCancelled(queueId, tokenId) {
        this.server.to(`queue:${queueId}`).emit('token:cancelled', { tokenId });
    }
    emitTokenSkipped(queueId, tokenId) {
        this.server.to(`queue:${queueId}`).emit('token:skipped', { tokenId });
    }
    emitQueueRefresh(queueId) {
        this.server.to(`queue:${queueId}`).emit('queue:refresh', { queueId });
    }
};
exports.QueueGateway = QueueGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], QueueGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinQueue'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], QueueGateway.prototype, "handleJoinQueue", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveQueue'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], QueueGateway.prototype, "handleLeaveQueue", null);
exports.QueueGateway = QueueGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' }, namespace: '/' })
], QueueGateway);
//# sourceMappingURL=queue.gateway.js.map