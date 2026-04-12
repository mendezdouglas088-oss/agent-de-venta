import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { MessageDto, ClearConversationDto } from './dto';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  /**
   * Recibe un mensaje del userbot y responde con contexto de conversación
   */
  @Post('message')
  async receiveMessage(@Body() dto: MessageDto) {
    return this.telegramService.handleMessage(dto);
  }

  /**
   * Obtiene productos para publicar en grupos
   */
  @Get('publish')
  async getPublishProducts() {
    const products = await this.telegramService.getPublishMessage();

    return products.map((product) => ({
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      description: product.description,
    }));
  }

  /**
   * Limpia el historial de conversación de un usuario
   */
  @Delete('conversation')
  async clearConversation(@Body() dto: ClearConversationDto) {
    return this.telegramService.clearConversation(dto.userId);
  }
}
