import { UserState } from './bot-context.interface';

/**
 * Interfaz para el gestor de estado.
 * Principio I (Interface Segregation): interfaz pequeña y específica.
 * Principio D (Dependency Inversion): dependemos de esta abstracción, no de Map o Redis directamente.
 * 
 * Esto permite cambiar la implementación (Memory -> Redis) sin tocar los handlers.
 */
export interface IStateManager {
  // Gestión de mensajes del bot
  registerMessage(chatId: number, messageId: number): void;
  getMessages(chatId: number): number[];
  clearMessages(chatId: number): void;

  // Estado del usuario (para ediciones en curso)
  setUserState(userId: number, state: UserState): void;
  getUserState(userId: number): UserState | undefined;
  clearUserState(userId: number): void;

  // Configuración global
  isConversationActive(): boolean;
  setConversationActive(active: boolean): void;
}

export const STATE_MANAGER = 'STATE_MANAGER';
