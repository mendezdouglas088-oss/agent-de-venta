import { Client } from 'whatsapp-web.js';

export type WhatsappMessageType =
  | 'chat'
  | 'image'
  | 'video'
  | 'audio'
  | 'ptt'
  | 'document'
  | 'sticker'
  | 'call_log'
  | 'location'
  | 'vcard'
  | 'unknown';

export interface WhatsappMediaPayload {
  mimetype: string;
  data: string; // base64
  filename?: string;
}

export interface WhatsappMessagePersistPayload {
  sessionId: string;
  chatId: string;
  chatName: string;
  messageId: string;
  fromMe: boolean;
  body: string;
  timestamp: number;
  ack: number;
  unreadCount: number;
  isGroup: boolean;
  type: WhatsappMessageType;
  hasMedia: boolean;
  author?: string;
  authorName?: string;
  mentionsMe: boolean;
  serializedId: string;
}

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
  lastMessage?: string;
  lastMessageAt?: number;
  unreadCount?: number;
  participantsCount?: number;
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
  isGroup: boolean;
  lastMessage?: string;
  lastMessageAt?: number;
  unreadCount: number;
  participantsCount?: number;
  isSavedContact?: boolean;
}

export interface WhatsappProvider {
  connect(sessionId: string): Promise<void>; // dispara la inicialización, no bloquea
  getQr(sessionId: string): Promise<Buffer | null>; // el cliente REST lo consulta hasta que exista
  getStatus(sessionId: string): WhatsappConnectionStatus;
  isConnected(sessionId: string): boolean;
  getGroups(sessionId: string): Promise<WhatsappGroupInterface[]>;
  getClient(sessionId: string): Client | null;
  getAllChats(sessionId: string): Promise<WhatsappChatSummary[]>;
  sendMedia(
    sessionId: string,
    chatId: string,
    media: WhatsappMediaPayload,
    options?: { caption?: string; sendAudioAsVoice?: boolean },
  ): Promise<SendResultInterface>;
  getMedia(
    sessionId: string,
    messageId: string,
  ): Promise<WhatsappMediaPayload | null>;
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
