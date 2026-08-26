import { Injectable } from '@nestjs/common';
import { IStateManager } from '../interfaces/state-manager.interface';
import { UserState } from '../interfaces/bot-context.interface';

/**
 * Implementación en memoria del gestor de estado.
 *
 * Principio S: Solo se encarga de gestionar estado.
 * Principio D: Implementa IStateManager, permitiendo sustituir por Redis.
 *
 * TODO: Para producción, implementar RedisStateManagerService que implemente
 * la misma interfaz IStateManager para persistencia entre reinicios.
 */
@Injectable()
export class StateManagerService implements IStateManager {
  // Mensajes del bot por chat (para poder eliminarlos)
  private readonly botMessages = new Map<number, number[]>();

  // Estado de usuarios durante ediciones
  private readonly userStates = new Map<number, UserState>();

  // Configuración global
  private conversationActive = false;

  // ============ Gestión de mensajes ============

  registerMessage(chatId: number, messageId: number): void {
    const messages = this.botMessages.get(chatId) ?? [];
    if (!messages.includes(messageId)) {
      messages.push(messageId);
    }
    this.botMessages.set(chatId, messages);
  }

  getMessages(chatId: number): number[] {
    return this.botMessages.get(chatId) ?? [];
  }

  clearMessages(chatId: number): void {
    this.botMessages.set(chatId, []);
  }

  hasMessages(chatId: number): boolean {
    const messages = this.botMessages.get(chatId);
    return !!messages && messages.length > 0;
  }

  // ============ Estado del usuario ============

  setUserState(userId: number, state: UserState): void {
    this.userStates.set(userId, state);
  }

  getUserState(userId: number): UserState | undefined {
    return this.userStates.get(userId);
  }

  clearUserState(userId: number): void {
    this.userStates.delete(userId);
  }

  // ============ Configuración global ============

  isConversationActive(): boolean {
    return this.conversationActive;
  }

  setConversationActive(active: boolean): void {
    this.conversationActive = active;
  }
}
