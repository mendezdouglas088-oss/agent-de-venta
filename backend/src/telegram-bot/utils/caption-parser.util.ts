import { ProductCaption } from 'src/commons/interfaces';

/**
 * Parsea el caption de una imagen de producto.
 * Formato esperado:
 * Nombre: valor
 * Precio: valor
 * Descripcion: valor
 * Cantidad: valor
 */
export function parseProductCaption(caption: string): ProductCaption {
  const result: Record<string, string> = {};

  caption.split('\n').forEach((line) => {
    const [key, ...rest] = line.split(':');
    if (!key || !rest.length) return;

    result[key.trim().toLowerCase()] = rest.join(':').trim();
  });

  return {
    name: result.nombre ?? '',
    price: Number(result.precio) || 0,
    description: result.descripcion ?? '',
    cant: Number(result.cantidad) || 0,
  };
}
