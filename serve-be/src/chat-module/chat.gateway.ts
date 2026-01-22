import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: { to: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Message from ${client.id} to ${data.to}: ${data.message}`);
    // Ideally save to DB via ChatService
    // Emit to specific user room
    this.server.to(data.to).emit('message', {
      from: client.id, // or user id from auth
      message: data.message,
    });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined ${room}`);
  }
}
