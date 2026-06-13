import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/' })
export class QueueGateway {
  @WebSocketServer()
  server: Server;

  // Client subscribes to updates for a queue room
  @SubscribeMessage('joinQueue')
  handleJoinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { queueId: string },
  ) {
    client.join(`queue:${data.queueId}`);
    client.emit('joinedQueue', { queueId: data.queueId });
  }

  @SubscribeMessage('leaveQueue')
  handleLeaveQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { queueId: string },
  ) {
    client.leave(`queue:${data.queueId}`);
  }

  // ─── Emit helpers called by services ────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitTokenJoined(queueId: string, token: any) {
    this.server.to(`queue:${queueId}`).emit('token:joined', token);
  }

  emitTokenCalled(
    queueId: string,
    payload: { tokenId: string; displayToken: string; customerName: string },
  ) {
    this.server.to(`queue:${queueId}`).emit('token:called', payload);
  }

  emitTokenCompleted(queueId: string, tokenId: string) {
    this.server.to(`queue:${queueId}`).emit('token:completed', { tokenId });
  }

  emitTokenCancelled(queueId: string, tokenId: string) {
    this.server.to(`queue:${queueId}`).emit('token:cancelled', { tokenId });
  }

  emitTokenSkipped(queueId: string, tokenId: string) {
    this.server.to(`queue:${queueId}`).emit('token:skipped', { tokenId });
  }

  // Signals all clients for this queue to re-fetch the full queue state
  emitQueueRefresh(queueId: string) {
    this.server.to(`queue:${queueId}`).emit('queue:refresh', { queueId });
  }
}
