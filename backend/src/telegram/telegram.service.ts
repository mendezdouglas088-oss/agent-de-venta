import { Injectable } from '@nestjs/common';
import { OllamaService } from 'src/ollama/ollama.service';
import { ProductsService } from 'src/products/products.service';
import { CONTEXT, REPLACEMENTS } from './constants/constants';
import { getAssistantPrompt } from './utils';
import { ConversationService } from './services/conversation.service';
import { GeminiProvider } from 'src/ai/providers/gemini.provider';
import { AIProvider } from 'src/ai/ai.interface';

import * as dotenv from 'dotenv';
dotenv.config();

/**
 * DTO para mensajes entrantes
 */
export interface IncomingMessageDto {
  message: string;
  userId: string | number; // ID del usuario de Telegram
}

@Injectable()
export class TelegramService {
  private aiProvider: AIProvider;

  constructor(
    private ollamaService: OllamaService,
    private productsService: ProductsService,
    private conversationService: ConversationService,
    private geminiProvider: GeminiProvider,
  ) {
    // Usar Gemini como proveedor de IA por defecto
    this.aiProvider = this.geminiProvider;
  }

  /**
   * Normaliza el texto eliminando abreviaciones comunes
   */
  private normalizeText(text: string): string {
    let normalized = text.toLowerCase();

    for (const [key, value] of Object.entries(REPLACEMENTS)) {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      normalized = normalized.replace(regex, value);
    }

    return normalized;
  }

  /**
   * Obtiene productos para publicar
   */
  async getPublishMessage() {
    return await this.productsService.findAll(false);
  }

  /**
   * Maneja un mensaje entrante con contexto de conversación
   */
  async handleMessage(dto: IncomingMessageDto) {
    const { message, userId } = dto;

    if (this.isOnlyEmoji(message)) return { reply: '👍' };

    // Normalizar texto
    const cleanText = this.normalizeText(message);

    // Guardar mensaje del usuario en el historial
    await this.conversationService.addMessage(userId, 'user', cleanText);

    // Obtener historial de conversación
    const conversationHistory =
      await this.conversationService.getFormattedHistory(userId);

    // Construir contexto
    const context = {
      ...CONTEXT,
      productos: [],
    };

    const productos = await this.productsService.findAll(true);
    context.productos = productos.map((product) => ({
      name: product.name,
      precio: product.price,
      descripcion: product.description,
      disponible: product.available ? 'si' : 'no',
    }));

    // Generar prompt con historial
    const prompt = getAssistantPrompt(cleanText, context, conversationHistory);

    // Obtener respuesta de la IA usando el proveedor configurado
    const response = await this.aiProvider.generateContent(prompt);

    // Guardar respuesta en el historial
    await this.conversationService.addMessage(userId, 'assistant', response);

    return { reply: response };
  }

  /**
   * Genera respuesta usando Ollama
   */
  private async generateResponse(prompt: string): Promise<string> {
    const response = await this.ollamaService.text(prompt);
    return response.trim();
  }

  private isOnlyEmoji(text: string): boolean {
    const cleaned = text
      .replace(/\s/g, '')
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}]/gu, '');

    return cleaned.length === 0;
  }

  /**
   * Limpia el historial de conversación de un usuario
   */
  async clearConversation(userId: string | number) {
    await this.conversationService.clearHistory(userId);
    return { ok: true, message: 'Conversación limpiada' };
  }

  /**
   * Obtiene la configuración (placeholder)
   */
  async getConfig() {
    return {
      maxMessages: 10,
      ttlMinutes: 30,
    };
  }
}
