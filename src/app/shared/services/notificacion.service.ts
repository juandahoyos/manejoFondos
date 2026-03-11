import { Injectable, signal } from '@angular/core';
import { Notificacion } from '../models/notificacion.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private readonly _notificaciones = signal<Notificacion[]>([]);
  readonly notificaciones = this._notificaciones.asReadonly();

  mostrar(mensaje: string, tipo: 'exito' | 'error' | 'info' = 'info', duracion = 4000): void {
    const notificacion: Notificacion = {
      id: crypto.randomUUID(),
      mensaje,
      tipo,
      duracion
    };

    this._notificaciones.update(lista => [...lista, notificacion]);

    if (duracion > 0) {
      setTimeout(() => this.cerrar(notificacion.id), duracion);
    }
  }

  exito(mensaje: string, duracion = 4000): void {
    this.mostrar(mensaje, 'exito', duracion);
  }

  error(mensaje: string, duracion = 5000): void {
    this.mostrar(mensaje, 'error', duracion);
  }

  info(mensaje: string, duracion = 4000): void {
    this.mostrar(mensaje, 'info', duracion);
  }

  cerrar(id: string): void {
    this._notificaciones.update(lista => lista.filter(n => n.id !== id));
  }
}
