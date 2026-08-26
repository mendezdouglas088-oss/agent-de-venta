import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Mensaje en el historial de conversación
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Servicio para gestionar el historial de conversaciones con Redis.
 *
 * Principio S: Solo se encarga de gestionar conversaciones.
 * Principio D: Puede abstraerse a una interfaz si se necesita otro storage.
 */
@Injectable()
export class ConversationService implements OnModuleDestroy {
  private redis: Redis;
  private readonly PREFIX = 'conversation:';
  private readonly MAX_MESSAGES = 10; // Últimos 10 mensajes por conversación
  private readonly TTL_SECONDS = 60 * 60 * 12; // 12 horas de inactividad

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      console.log('✅ Redis connected for conversations');
    });

    this.redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  /**
   * Obtiene la key de Redis para un usuario
   */
  private getKey(userId: string | number): string {
    return `${this.PREFIX}${userId}`;
  }

  /**
   * Agrega un mensaje al historial de conversación
   */
  async addMessage(
    userId: string | number,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<void> {
    const key = this.getKey(userId);
    const message: ConversationMessage = {
      role,
      content,
      timestamp: Date.now(),
    };

    // Agregar al final de la lista
    await this.redis.rpush(key, JSON.stringify(message));

    // Mantener solo los últimos N mensajes
    await this.redis.ltrim(key, -this.MAX_MESSAGES, -1);

    // Renovar TTL
    await this.redis.expire(key, this.TTL_SECONDS);
  }

  /**
   * Obtiene el historial de conversación de un usuario
   */
  async getHistory(userId: string | number): Promise<ConversationMessage[]> {
    const key = this.getKey(userId);
    const messages = await this.redis.lrange(key, 0, -1);

    return messages.map((msg) => JSON.parse(msg));
  }

  /**
   * Formatea el historial para incluirlo en el prompt
   */
  async getFormattedHistory(userId: string | number): Promise<string> {
    const history = await this.getHistory(userId);

    if (history.length === 0) {
      return 'Sin historial previo.';
    }

    return history
      .map((msg) => {
        const prefix = msg.role === 'user' ? 'Usuario' : 'Asistente';
        return `${prefix}: ${msg.content}`;
      })
      .join('\n');
  }

  /**
   * Limpia el historial de un usuario
   */
  async clearHistory(userId: string | number): Promise<void> {
    const key = this.getKey(userId);
    await this.redis.del(key);
  }

  /**
   * Verifica si un usuario tiene historial
   */
  async hasHistory(userId: string | number): Promise<boolean> {
    const key = this.getKey(userId);
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  /**
   * Obtiene todas las claves de conversaciones activas
   */
  async getAllConversationKeys(): Promise<string[]> {
    const keys = await this.redis.keys(`${this.PREFIX}*`);
    return keys;
  }

  /**
   * Limpia conversaciones expiradas (sin interacción por más de 12 horas)
   * Este método se ejecuta periódicamente para limpiar Redis
   */
  async cleanupExpiredConversations(): Promise<number> {
    const keys = await this.getAllConversationKeys();
    let cleanedCount = 0;

    for (const key of keys) {
      // Verificar si la clave existe (si no existe, ya fue expirada por Redis)
      const exists = await this.redis.exists(key);
      if (exists === 0) {
        cleanedCount++;
      }
    }

    console.log(
      `🧹 Limpieza de conversaciones: ${cleanedCount} conversaciones expiradas`,
    );
    return cleanedCount;
  }
}
