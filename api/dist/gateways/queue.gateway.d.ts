import { Server, Socket } from 'socket.io';
export declare class QueueGateway {
    server: Server;
    handleJoinQueue(client: Socket, data: {
        queueId: string;
    }): void;
    handleLeaveQueue(client: Socket, data: {
        queueId: string;
    }): void;
    emitTokenJoined(queueId: string, token: any): void;
    emitTokenCalled(queueId: string, payload: {
        tokenId: string;
        displayToken: string;
        customerName: string;
    }): void;
    emitTokenCompleted(queueId: string, tokenId: string): void;
    emitTokenCancelled(queueId: string, tokenId: string): void;
    emitTokenSkipped(queueId: string, tokenId: string): void;
    emitQueueRefresh(queueId: string): void;
}
