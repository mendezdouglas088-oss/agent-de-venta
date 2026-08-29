import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class RealtimeGateway {
  @WebSocketServer() server: Server;

  // el frontend se une a la "room" de su sessionId al conectar
  @SubscribeMessage('join')
  onJoin(@MessageBody() sessionId: string, @ConnectedSocket() client: Socket) {
    client.join(sessionId);
  }

  @OnEvent('whatsapp.message.received')
  handleWhatsappMessage(payload: any) {
    this.server.to(payload.sessionId).emit('whatsapp:message', payload);
  }
}
