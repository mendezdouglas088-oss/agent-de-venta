/**
 * Interfaz para proveedores de IA
 * 
 * Principio D: Dependency Inversion - Depender de abstracciones, no de implementaciones
 */
export interface AIProvider {
  /**
   * Genera contenido basado en un prompt
   */
  generateContent(prompt: string): Promise<string>;

  /**
   * Obtiene el nombre del proveedor
   */
  getName(): string;
}
