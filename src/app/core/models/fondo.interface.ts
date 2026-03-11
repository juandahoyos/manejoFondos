export interface Fondo {
  id: string;
  nombre: string;
  montoMinimo: number;
  categoria: 'FPV' | 'FIC';
}