import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class QueueGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket Server initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Queue event emissions
  emitTokenJoined(queueId: string, token: any) {
    this.server.emit(`queue:${queueId}:token-joined`, token);
  }

  emitQueueRefresh(queueId: string) {
    this.server.emit(`queue:${queueId}:refresh`);
  }

  emitTokenCalled(queueId: string, data: { tokenId: string; displayToken: string; customerName: string }) {
    this.server.emit(`queue:${queueId}:token-called`, data);
  }

  emitTokenCompleted(queueId: string, tokenId: string) {
    this.server.emit(`queue:${queueId}:token-completed`, { tokenId });
  }

  emitTokenSkipped(queueId: string, tokenId: string) {
    this.server.emit(`queue:${queueId}:token-skipped`, { tokenId });
  }

  emitTokenCancelled(queueId: string, tokenId: string) {
    this.server.emit(`queue:${queueId}:token-cancelled`, { tokenId });
  }
}
