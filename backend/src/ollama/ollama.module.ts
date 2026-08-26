import { Module } from '@nestjs/common';
import { OllamaService } from './ollama.service';

@Module({
  providers: [OllamaService],
  exports: [OllamaService],
})
export class OllamaModule {}
