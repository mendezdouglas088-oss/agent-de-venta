import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { JwtModule } from '@nestjs/jwt';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    WhatsappModule,
  ],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
