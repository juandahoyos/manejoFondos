export interface Transaccion {
  id: string;
  fondoId: string;
  nombreFondo: string;
  tipo: 'Suscripción' | 'Cancelación';
  monto: number;
  fecha: Date;
  metodoNotificacion?: 'email' | 'sms';
}