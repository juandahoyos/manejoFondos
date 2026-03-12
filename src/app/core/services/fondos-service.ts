import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Fondo } from '../models/fondo.interface';
import { EstadoUsuario } from '../models/estadoUsuario.interface';
import { Transaccion } from '../models/transaccion.interface';


@Injectable({
  providedIn: 'root'
})
export class FondoService {
  // Base de datos simuladada
  private readonly FONDOS_DISPONIBLES: Fondo[] = [
    { id: '1', nombre: 'FPV_BTG_PACTUAL_RECAUDADORA', montoMinimo: 75000, categoria: 'FPV' },
    { id: '2', nombre: 'FPV_BTG_PACTUAL_ECOPETROL', montoMinimo: 125000, categoria: 'FPV' },
    { id: '3', nombre: 'DEUDAPRIVADA', montoMinimo: 50000, categoria: 'FIC' },
    { id: '4', nombre: 'FDO-ACCIONES', montoMinimo: 250000, categoria: 'FIC' },
    { id: '5', nombre: 'FPV_BTG_PACTUAL_DINAMICA', montoMinimo: 100000, categoria: 'FPV' }
  ];

  // Estado del usuario (Saldo inicial COP $500.000)
  private readonly estadoUsuarioSubject = new BehaviorSubject<EstadoUsuario>({
    saldo: 500000,
    fondosSuscritos: []
  });
  public estadoUsuario$ = this.estadoUsuarioSubject.asObservable();

  // Historial de transacciones
  private readonly transaccionesSubject = new BehaviorSubject<Transaccion[]>([]);
  public transacciones$ = this.transaccionesSubject.asObservable();

  constructor() { }

  obtenerFondosDisponibles(): Observable<Fondo[]> {
    return timer(500).pipe(map(() => this.FONDOS_DISPONIBLES));
  }

  suscribirseAFondo(fondo: Fondo, monto: number, notificacion: 'email' | 'sms'): Observable<boolean> {
    return timer(600).pipe(
      switchMap(() => {
        const estado = this.estadoUsuarioSubject.value;
        // Validaciones
        if (monto < fondo.montoMinimo) {
          return throwError(() => new Error(`El monto mínimo de vinculación es de COP $${fondo.montoMinimo}`));
        }
        if (estado.saldo < monto) {
          return throwError(() => new Error(`No tiene saldo suficiente para vincularse al fondo ${fondo.nombre}`));
        }
        if (estado.fondosSuscritos.includes(fondo.id)) {
          return throwError(() => new Error('Ya estás suscrito a este fondo.'));
        }

        // Actualizar estado
        this.estadoUsuarioSubject.next({
          saldo: estado.saldo - monto,
          fondosSuscritos: [...estado.fondosSuscritos, fondo.id]
        });

        // Registrar transacción
        this.agregarTransaccion({
          id: crypto.randomUUID(),
          fondoId: fondo.id,
          nombreFondo: fondo.nombre,
          tipo: 'Suscripción',
          monto: monto,
          fecha: new Date(),
          metodoNotificacion: notificacion
        });

        return [true];
      })
    );
  }

  cancelarSuscripcion(fondoId: string): Observable<boolean> {
    return timer(400).pipe(
      switchMap(() => {
        const estado = this.estadoUsuarioSubject.value;
        const transaccionOriginal = this.transaccionesSubject.value.find(
          t => t.fondoId === fondoId && t.tipo === 'Suscripción'
        );

        if (!transaccionOriginal) {
          return throwError(() => new Error('No estás suscrito a este fondo.'));
        }

        // Devolver dinero y remover fondo
        this.estadoUsuarioSubject.next({
          saldo: estado.saldo + transaccionOriginal.monto,
          fondosSuscritos: estado.fondosSuscritos.filter(id => id !== fondoId)
        });

        this.agregarTransaccion({
          id: crypto.randomUUID(),
          fondoId: fondoId,
          nombreFondo: transaccionOriginal.nombreFondo,
          tipo: 'Cancelación',
          monto: transaccionOriginal.monto,
          fecha: new Date()
        });

        return [true];
      })
    );
  }

  private agregarTransaccion(transaccion: Transaccion) {
    const actuales = this.transaccionesSubject.value;
    this.transaccionesSubject.next([transaccion, ...actuales]);
  }
}