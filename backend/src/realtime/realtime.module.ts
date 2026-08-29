import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  imports: [],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
