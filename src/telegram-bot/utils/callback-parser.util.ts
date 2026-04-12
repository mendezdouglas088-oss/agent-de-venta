/**
 * Utilidades para parsear datos de callbacks de Telegram.
 * Evita duplicar lógica de split/regex en cada handler.
 */

export interface ParsedCallback {
  id: string;
  page: number;
}

/**
 * Parsea callbacks con formato: PREFIX_ID_PAGE_N
 * Ejemplo: PRODUCT_SELECT_abc-123_PAGE_2
 */
export function parseSelectCallback(data: string): ParsedCallback {
  const parts = data.split('_');
  const page = Number(parts.pop()); // último elemento es el número de página
  parts.pop(); // elimina 'PAGE'
  const id = parts.pop(); // el ID está en posición 2

  return { id, page };
}

/**
 * Parsea callbacks de paginación: PREFIX_PAGE_N
 * Ejemplo: PRODUCT_SELECT_PAGE_3
 */
export function parsePageCallback(data: string): number {
  return Number(data.split('_').pop());
}

/**
 * Parsea callbacks de edición de campo: EDIT_ENTITY_FIELD_ID
 * Ejemplo: EDIT_PRODUCT_NAME_abc-123
 */
export function parseEditFieldCallback(
  data: string,
  pattern: RegExp,
): { field: string; id: string } | null {
  const match = data.match(pattern);
  if (!match) return null;

  return {
    field: match[1],
    id: match[2],
  };
}

/**
 * Extrae el ID del final de un callback
 * Ejemplo: DELETE_PRODUCT_abc-123 -> abc-123
 */
export function extractIdFromCallback(data: string): string {
  return data.split('_').pop() ?? '';
}
