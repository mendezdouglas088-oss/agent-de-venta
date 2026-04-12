import { IsNumber, IsString } from 'class-validator';

export class SyncTelegramGroupDto {
  @IsString()
  title: string;

  @IsNumber()
  id: number;

  members: { username: string; telegramUserId: number }[];
}

export class SyncTelegramGroupsDto {
  // @IsArray()
  group: SyncTelegramGroupDto;
}
