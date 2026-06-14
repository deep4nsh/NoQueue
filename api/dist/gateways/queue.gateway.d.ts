import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class QueueGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitTokenJoined(queueId: string, token: any): void;
    emitQueueRefresh(queueId: string): void;
    emitTokenCalled(queueId: string, data: {
        tokenId: string;
        displayToken: string;
        customerName: string;
    }): void;
    emitTokenCompleted(queueId: string, tokenId: string): void;
    emitTokenSkipped(queueId: string, tokenId: string): void;
    emitTokenCancelled(queueId: string, tokenId: string): void;
}
