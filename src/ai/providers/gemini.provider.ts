import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { AIProvider } from '../ai.interface';

/**
 * Proveedor de IA usando Google Gemini
 * 
 * Principio S: Solo se encarga de comunicarse con Gemini
 */
@Injectable()
export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  /**
   * Genera contenido usando Gemini
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
        config: {
          temperature: 0.3,
          topP: 0.9,
          maxOutputTokens: 150,
        },
      });

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No response from Gemini');
      }

      const text = response.candidates[0].content.parts[0].text;
      return text.trim();
    } catch (error) {
      console.error('❌ Error en Gemini:', error);
      throw new Error(`Error generando respuesta con Gemini: ${error.message}`);
    }
  }

  /**
   * Obtiene el nombre del proveedor
   */
  getName(): string {
    return 'Gemini';
  }
}
