import { Injectable } from '@nestjs/common';
import { OllamaService } from 'src/ollama/ollama.service';
import { AIProvider } from '../ai.interface';

/**
 * Proveedor de IA usando Ollama
 * 
 * Principio S: Solo se encarga de comunicarse con Ollama
 */
@Injectable()
export class OllamaProvider implements AIProvider {
  constructor(private ollamaService: OllamaService) {}

  /**
   * Genera contenido usando Ollama
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await this.ollamaService.text(prompt);
      return response.trim();
    } catch (error) {
      console.error('❌ Error en Ollama:', error);
      throw new Error(`Error generando respuesta con Ollama: ${error.message}`);
    }
  }

  /**
   * Obtiene el nombre del proveedor
   */
  getName(): string {
    return 'Ollama';
  }
}
