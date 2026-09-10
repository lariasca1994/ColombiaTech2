import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

/**
 * Reemplaza el bloque comentado de Tech/index.js — esa versión nunca se
 * activó (io.on('connect', ...) estaba comentado y el servidor arrancaba
 * con app.listen en vez de http.listen). Aquí el chat en tiempo real
 * queda realmente implementado, usando MessagesService para persistir
 * cada mensaje antes de retransmitirlo — igual que intentaba hacer la
 * versión comentada, pero completo.
 *
 * Mantiene los mismos nombres de evento que ya esperaba el frontend
 * (Chat.jsx): escucha 'message' y emite 'message-receipt', para que el
 * cliente necesite el mínimo cambio posible.
 */
@WebSocketGateway({
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() payload: CreateMessageDto) {
    try {
      const saved = await this.messagesService.create(payload);
      // A todos los clientes conectados, igual que hacía
      // socket.broadcast.emit('message-receipt', ...) en la versión
      // comentada — solo que esta sí se ejecuta.
      this.server.emit('message-receipt', saved);
      return saved;
    } catch (error) {
      this.logger.error('Error guardando mensaje de chat', error);
      return { status: 'error', message: error.message };
    }
  }
}
