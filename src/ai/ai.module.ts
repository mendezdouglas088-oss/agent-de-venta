import { Module } from '@nestjs/common';
import { GeminiProvider, OllamaProvider } from './providers';
import { OllamaModule } from 'src/ollama/ollama.module';

/**
 * Módulo de IA que proporciona diferentes proveedores
 * 
 * Principio O: Abierto a extensión (nuevos proveedores), cerrado a modificación
 */
@Module({
  imports: [OllamaModule],
  providers: [GeminiProvider, OllamaProvider],
  exports: [GeminiProvider, OllamaProvider],
})
export class AIModule {}
