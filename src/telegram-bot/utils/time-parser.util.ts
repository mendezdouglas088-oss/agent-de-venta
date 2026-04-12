/**
 * Utilidad para parsear y validar tiempos con unidades.
 * 
 * Formatos soportados:
 * - 5s = 5 segundos
 * - 5m = 5 minutos
 * - 5d = 5 días
 * - 5S = 5 semanas
 * - 5M = 5 meses
 * 
 * Principio S: Solo se encarga de parsear tiempos.
 */

export interface ParsedTime {
  value: number;
  unit: 's' | 'm' | 'd' | 'S' | 'M';
  seconds: number;
}

/**
 * Convierte unidades de tiempo a segundos
 */
function convertToSeconds(value: number, unit: string): number {
  switch (unit) {
    case 's':
      return value; // segundos
    case 'm':
      return value * 60; // minutos
    case 'd':
      return value * 60 * 60 * 24; // días
    case 'S':
      return value * 60 * 60 * 24 * 7; // semanas
    case 'M':
      return value * 60 * 60 * 24 * 30; // meses (aproximado a 30 días)
    default:
      throw new Error(`Unidad de tiempo no válida: ${unit}`);
  }
}

/**
 * Parsea un string de tiempo con formato: número + unidad
 * Ejemplos: "5s", "10m", "2d", "1S", "3M"
 * 
 * @param timeString String a parsear
 * @returns Objeto con valor, unidad y equivalente en segundos
 * @throws Error si el formato no es válido
 */
export function parseTimeString(timeString: string): ParsedTime {
  const timeString_trimmed = timeString.trim();

  // Validar formato: número pegado con letra
  const match = timeString_trimmed.match(/^(\d+)([smSdM])$/);

  if (!match) {
    throw new Error(
      `Formato de tiempo inválido: "${timeString_trimmed}". Use formato como: 5s, 10m, 2d, 1S, 3M`,
    );
  }

  const value = parseInt(match[1], 10);
  const unit = match[2] as 's' | 'm' | 'd' | 'S' | 'M';

  if (value <= 0) {
    throw new Error('El valor del tiempo debe ser mayor a 0');
  }

  const seconds = convertToSeconds(value, unit);

  return {
    value,
    unit,
    seconds,
  };
}

/**
 * Obtiene una descripción legible del tiempo
 */
export function getTimeDescription(parsed: ParsedTime): string {
  const unitNames: Record<string, string> = {
    s: 'segundo(s)',
    m: 'minuto(s)',
    d: 'día(s)',
    S: 'semana(s)',
    M: 'mes(es)',
  };

  return `${parsed.value} ${unitNames[parsed.unit]} (${parsed.seconds}s)`;
}
