import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WhatsappRegisteredContactsService } from '../services/whatsapp-registered-contact.service';

@UseGuards(JwtAuthGuard)
@Controller('whatsapp-registered-contacts')
export class WhatsappRegisteredContactsController {
  constructor(
    private readonly contactsService: WhatsappRegisteredContactsService,
  ) {}

  @Post()
  create(
    @Query('connectionId') connectionId: string,
    @Body()
    body: {
      chatId: string;
      name: string;
      phoneNumber?: string;
      notes?: string;
    },
  ) {
    return this.contactsService.create({
      sessionId: connectionId,
      chatId: body.chatId,
      name: body.name,
      phoneNumber: body.phoneNumber,
      notes: body.notes,
    });
  }

  @Get()
  findAll(@Query('connectionId') connectionId: string) {
    return this.contactsService.findAll(connectionId);
  }

  @Get(':id')
  findOne(
    @Query('connectionId') connectionId: string,
    @Param('id') id: string,
  ) {
    return this.contactsService.findOne(connectionId, id);
  }

  @Patch(':id')
  update(
    @Query('connectionId') connectionId: string,
    @Param('id') id: string,
    @Body() body: { name?: string; phoneNumber?: string; notes?: string },
  ) {
    return this.contactsService.update(connectionId, id, body);
  }

  @Delete(':id')
  remove(@Query('connectionId') connectionId: string, @Param('id') id: string) {
    return this.contactsService.remove(connectionId, id);
  }
}
