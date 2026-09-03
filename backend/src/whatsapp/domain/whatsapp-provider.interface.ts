export type WhatsappConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'waiting_qr'
  | 'connected'
  | 'auth_failed'
  | 'error';

export interface WhatsappGroupInterface {
  whatsappGroupId: string;
  title: string;
}

export interface WhatsappConnectionsInterface {
  nameUserConnected: string;
  user: any;
}

export interface WhatsappContact {
  chatId: string; // identificador único, ej: 5215512345678@c.us
  name: string;
  phoneNumber: string;
}

export interface SendResultInterface {
  ok: boolean;
  error?: string;
}

// interface
export interface WhatsappChatSummary {
  chatId: string;
  name: string;
  lastMessage?: string;
  lastMessageAt?: number;
  unreadCount: number;
}

export interface WhatsappProvider {
  connect(sessionId: string): Promise<void>; // dispara la inicialización, no bloquea
  getQr(sessionId: string): Promise<Buffer | null>; // el cliente REST lo consulta hasta que exista
  getStatus(sessionId: string): WhatsappConnectionStatus;
  isConnected(sessionId: string): boolean;
  getGroups(sessionId: string): Promise<WhatsappGroupInterface[]>;
  sendText(
    sessionId: string,
    groupId: string,
    text: string,
  ): Promise<SendResultInterface>;
  sendImages(
    sessionId: string,
    groupId: string,
    imageUrls: string[],
    caption?: string,
  ): Promise<SendResultInterface>;
  getAllConnectedSessionIds(): string[];
  getContact(sessionId: string, chatId: string): Promise<WhatsappContact>;
  logout(sessionId: string): Promise<void>;
  getChats(sessionId: string): Promise<WhatsappChatSummary[]>;
}

export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');
