import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';

/**
 * Scheduler para limpiar conversaciones expiradas de Redis.
 *
 * Ejecuta cada hora para verificar y limpiar conversaciones sin interacción
 * por más de 12 horas.
 *
 * Principio S: Solo se encarga de programar la limpieza de conversaciones.
 */
@Injectable()
export class ConversationCleanupScheduler implements OnModuleInit {
  private cleanupInterval: NodeJS.Timeout;
  private readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Cada hora

  constructor(private readonly conversationService: ConversationService) {}

  onModuleInit() {
    this.startCleanupScheduler();
  }

  /**
   * Inicia el scheduler de limpieza
   */
  private startCleanupScheduler(): void {
    console.log(
      '🧹 Iniciando scheduler de limpieza de conversaciones (cada hora)',
    );

    // Ejecutar limpieza inmediatamente
    this.runCleanup();

    // Ejecutar limpieza cada hora
    this.cleanupInterval = setInterval(() => {
      this.runCleanup();
    }, this.CLEANUP_INTERVAL_MS);
  }

  /**
   * Ejecuta la limpieza de conversaciones expiradas
   */
  private async runCleanup(): Promise<void> {
    try {
      const cleanedCount =
        await this.conversationService.cleanupExpiredConversations();
      console.log(
        `✅ Limpieza completada: ${cleanedCount} conversaciones verificadas`,
      );
    } catch (error) {
      console.error('❌ Error durante la limpieza de conversaciones:', error);
    }
  }

  /**
   * Detiene el scheduler
   */
  stopCleanupScheduler(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      console.log('⏹️ Scheduler de limpieza detenido');
    }
  }
}
