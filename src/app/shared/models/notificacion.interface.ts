export interface Notificacion {
  id: string;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info';
  duracion?: number;
}
