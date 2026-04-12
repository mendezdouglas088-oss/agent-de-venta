export const MENU_OPTIONS = {
  PRODUCTS: {
    nameGeneral: 'PRODUCTS',
    nameItem: '📦 Productos',
    list: 'LIST_PRODUCTS',
  },
  GROUPS: {
    nameGeneral: 'GROUPS',
    nameItem: '🌎 Grupos',
    list: 'LIST_GROUPS',
    telegram: 'LIST_TELEGRAM_GROUPS',
    whatsapp: 'LIST_WHATSAPP_GROUPS',
  },
  PUBLICATIONS: {
    nameGeneral: 'PUBLICATIONS',
    nameItem: '📢 Publicaciones',
    list: 'LIST_PUBLICATIONS',
  },
  MESSENGERS: {
    nameGeneral: 'MESSENGERS',
    nameItem: '🚴 Mensajeros',
    list: 'LIST_MESSENGERS',
  },
  PLAN: {
    nameGeneral: 'PLAN_MENU',
    nameItem: '📋 Plan',
    selectDaily: 'PLAN_SELECT_DAILY',
    selectPro: 'PLAN_SELECT_PRO',
  },
  ADMIN: {
    users: 'ADMIN_USERS',
    userDetail: 'ADMIN_USER_DETAIL',
    userDelete: 'ADMIN_USER_DELETE',
    userToggle: 'ADMIN_USER_TOGGLE',
    userPublications: 'ADMIN_USER_PUBLICATIONS',
    userProducts: 'ADMIN_USER_PRODUCTS',
  },
  TRANSFERS: {
    nameGeneral: 'TRANSFERS',
    nameItem: '💸 Transferencias',
    sortToggle: 'TRANSFERS_SORT_TOGGLE',
  },
  PAYMENT: {
    method: 'PAYMENT_METHOD',
    transfermovil: 'PAYMENT_TRANSFERMOVIL',
  },
  HOME: { nameGeneral: 'BACK_HOME', nameItem: '🏠 Home' },
  STATS: 'STATS',
  SETTINGS: 'SETTINGS_OPTIONS_0',
  CARRITO: 'CARRITO',
  CONNECT: {
    whatsapp: 'CONFIG_CONNECT_WHATSAPP',
    telegram: 'CONFIG_CONNECT_TELEGRAM',
  },
} as const;

export const BOT_COMMANDS = ['/start', '/help'] as const;

export const CALLBACK_PREFIXES = {
  PRODUCT_SELECT: 'PRODUCT_SELECT',
  GROUPS_SELECT: 'GROUPS_SELECT',
  WHATSAPP_GROUPS_SELECT: 'WHATSAPP_GROUPS_SELECT',
  PUBLICATION_SELECT: 'PUBLICATION_SELECT',
  MESSENGER_SELECT: 'MESSENGER_SELECT',
  EDIT_PRODUCT: 'EDIT_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  GROUPS_EDIT: 'GROUPS_EDIT',
  WHATSAPP_GROUPS_EDIT: 'WHATSAPP_GROUPS_EDIT',
  PUBLICATION_TOGGLE: 'PUBLICATION_TOGGLE',
  ADMIN_USER: 'ADMIN_USER',
} as const;

export const CALLBACK_PATTERNS = {
  PRODUCT_PAGE: /^PRODUCT_SELECT_PAGE_(\d+)$/,
  PRODUCT_SELECT: /^PRODUCT_SELECT_([a-f0-9\-]+)_PAGE_(\d+)$/,
  PRODUCT_EDIT: /^EDIT_PRODUCT_([a-f0-9\-]+)$/,
  PRODUCT_EDIT_FIELD:
    /^EDIT_PRODUCT_(NAME|PRICE|DESC|ENABLED|DELETE)_([a-f0-9\-]+)$/,
  PRODUCT_DELETE: /^DELETE_PRODUCT_([a-f0-9\-]+)$/,
  GROUPS_PAGE: /^GROUPS_SELECT_PAGE_(\d+)$/,
  GROUPS_SELECT: /^GROUPS_SELECT_(?!PAGE_)(\d+)_PAGE_(\d+)$/,
  GROUPS_EDIT: /^GROUPS_EDIT_(\d+)_PAGE_(\d+)$/,
  WHATSAPP_GROUPS_PAGE: /^WHATSAPP_GROUPS_SELECT_PAGE_(\d+)$/,
  WHATSAPP_GROUPS_SELECT: /^WHATSAPP_GROUPS_SELECT_(?!PAGE_)(\d+)_PAGE_(\d+)$/,
  WHATSAPP_GROUPS_EDIT: /^WHATSAPP_GROUPS_EDIT_(\d+)_PAGE_(\d+)$/,
  PUBLICATION_PAGE: /^PUBLICATION_SELECT_PAGE_(\d+)$/,
  PUBLICATION_SELECT: /^PUBLICATION_SELECT_([a-f0-9\-]+)_PAGE_(\d+)$/,
  PUBLICATION_TOGGLE: /^PUBLICATION_TOGGLE_([a-f0-9\-]+)_PAGE_(\d+)$/,
  MESSENGER_PAGE: /^MESSENGER_SELECT_PAGE_(\d+)$/,
  MESSENGER_SELECT: /^MESSENGER_SELECT_(.+)$/,
  SETTINGS: /^SETTINGS_OPTIONS_(\d+)$/,
  ADD_ITEM: /_ADD$/,
  // Admin patterns
  ADMIN_USERS_PAGE: /^ADMIN_USERS_PAGE_(\d+)$/,
  ADMIN_USER_DETAIL: /^ADMIN_USER_DETAIL_([a-f0-9\-]+)$/,
  ADMIN_USER_DELETE: /^ADMIN_USER_DELETE_([a-f0-9\-]+)$/,
  ADMIN_USER_TOGGLE: /^ADMIN_USER_TOGGLE_([a-f0-9\-]+)$/,
  ADMIN_USER_PUBLICATIONS: /^ADMIN_USER_PUBS_([a-f0-9\-]+)$/,
  ADMIN_USER_PRODUCTS: /^ADMIN_USER_PRODS_([a-f0-9\-]+)$/,
  // Transfer patterns
  TRANSFERS_PAGE: /^TRANSFERS_PAGE_(\d+)_(\d)$/,
  TRANSFER_DETAIL: /^TRANSFER_DETAIL_([a-f0-9\-]+)$/,
  TRANSFER_APPROVE: /^TRANSFER_APPROVE_([a-f0-9\-]+)$/,
  TRANSFER_REJECT: /^TRANSFER_REJECT_([a-f0-9\-]+)$/,
  // Payment method patterns
  PAYMENT_PLAN: /^PAYMENT_METHOD_(DAILY|PRO)$/,
  PAYMENT_TRANSFERMOVIL: /^PAYMENT_TM_(DAILY|PRO)$/,
} as const;
