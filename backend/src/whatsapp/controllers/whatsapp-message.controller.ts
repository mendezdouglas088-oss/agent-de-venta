import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WhatsappMessageService } from '../services/whatsapp-message.service';

@UseGuards(JwtAuthGuard)
@Controller('whatsapp-messages')
export class WhatsappMessagesController {
  constructor(private readonly messageService: WhatsappMessageService) {}
}
