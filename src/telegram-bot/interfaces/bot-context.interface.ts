import { Context } from 'telegraf';

export type BotContext = Context & {
  from: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    is_bot?: boolean;
  };
  chat: {
    id: number;
    type: string;
  };
};

export interface UserState {
  action: string;
  field?: string;
  productId?: string;
  settingType?: 'PUBLISH_INTERVAL' | 'SYNC_INTERVAL' | 'CONFIG_REFRESH_INTERVAL';
  requestMessageId?: number;
  data?: any;
}

export interface PaginationOptions<T> {
  ctx: BotContext;
  items: T[];
  page?: number;
  pageSize?: number;
  getText: (item: T, index: number) => string;
  getId: (item: T) => string | number;
  callbackPrefix: string;
  backAction: string;
  showSearch?: boolean;
  showAddButton?: boolean;
}
