import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FondoService } from './fondos-service';
import { Fondo } from '../models/fondo.interface';

describe('FondoService', () => {
  let service: FondoService;
  const fondoMock: Fondo = { id: '1', nombre: 'FPV_BTG', montoMinimo: 75000, categoria: 'FPV' };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FondoService);
  });

  it('debe iniciar con saldo de $500,000, sin fondos suscritos ni transacciones', (done) => {
    service.estadoUsuario$.subscribe(estado => {
      expect(estado.saldo).toBe(500000);
      expect(estado.fondosSuscritos).toEqual([]);
    });
    service.transacciones$.subscribe(transacciones => {
      expect(transacciones).toEqual([]);
      done();
    });
  });

  it('debe retornar 5 fondos con categorías FPV y FIC', fakeAsync(() => {
    let fondos: Fondo[] = [];
    service.obtenerFondosDisponibles().subscribe(r => fondos = r);
    tick(600);

    expect(fondos.length).toBe(5);
    expect(fondos.filter(f => f.categoria === 'FPV').length).toBe(3);
    expect(fondos.filter(f => f.categoria === 'FIC').length).toBe(2);
  }));

  it('debe suscribir, restar saldo y registrar transacción', fakeAsync(() => {
    service.suscribirseAFondo(fondoMock, 100000, 'email').subscribe();
    tick(700);

    service.estadoUsuario$.subscribe(estado => {
      expect(estado.saldo).toBe(400000);
      expect(estado.fondosSuscritos).toContain('1');
    });

    service.transacciones$.subscribe(transacciones => {
      expect(transacciones[0].tipo).toBe('Suscripción');
      expect(transacciones[0].monto).toBe(100000);
    });
  }));

  it('debe validar monto mínimo, saldo suficiente y duplicados', fakeAsync(() => {
    let error = '';
    service.suscribirseAFondo(fondoMock, 50000, 'email').subscribe({ error: e => error = e.message });
    tick(700);
    expect(error).toContain('monto mínimo');

    service.suscribirseAFondo(fondoMock, 600000, 'email').subscribe({ error: e => error = e.message });
    tick(700);
    expect(error).toContain('saldo suficiente');

    service.suscribirseAFondo(fondoMock, 75000, 'email').subscribe();
    tick(700);
    service.suscribirseAFondo(fondoMock, 75000, 'email').subscribe({ error: e => error = e.message });
    tick(700);
    expect(error).toContain('Ya estás suscrito');
  }));

  it('debe cancelar y devolver dinero al saldo', fakeAsync(() => {
    service.suscribirseAFondo(fondoMock, 100000, 'email').subscribe();
    tick(700);

    service.cancelarSuscripcion('1').subscribe();
    tick(500);

    service.estadoUsuario$.subscribe(estado => {
      expect(estado.saldo).toBe(500000);
      expect(estado.fondosSuscritos).not.toContain('1');
    });

    service.transacciones$.subscribe(transacciones => {
      expect(transacciones.find(t => t.tipo === 'Cancelación')).toBeTruthy();
    });
  }));
});
