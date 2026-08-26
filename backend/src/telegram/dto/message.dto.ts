import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO para mensajes entrantes del userbot
 */
export class MessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  userId: string | number;
}

/**
 * DTO para limpiar conversación
 */
export class ClearConversationDto {
  @IsNotEmpty()
  userId: string | number;
}
