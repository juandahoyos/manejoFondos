import { render, screen } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

import { HistorialComponent } from './historial';
import { FondoService } from '@core/services/fondos-service';
import { Transaccion } from '@core/models/transaccion.interface';

describe('HistorialComponent', () => {
  let transaccionesSubject: BehaviorSubject<Transaccion[]>;

  const FECHA_FIJA = new Date('2026-03-12T10:00:00');
  const crearTransaccionMock = (overrides: Partial<Transaccion> = {}): Transaccion => ({
    id: 'tx1',
    fondoId: '1',
    nombreFondo: 'FPV_BTG',
    tipo: 'Suscripción',
    monto: 100000,
    fecha: FECHA_FIJA,
    metodoNotificacion: 'email',
    ...overrides
  });

  const setupComponent = async (transacciones: Transaccion[] = []) => {
    transaccionesSubject.next(transacciones);
    const fondoServiceSpy = jasmine.createSpyObj('FondoService', [], {
      transacciones$: transaccionesSubject.asObservable()
    });

    return await render(HistorialComponent, {
      providers: [{ provide: FondoService, useValue: fondoServiceSpy }]
    });
  };

  beforeEach(() => {
    transaccionesSubject = new BehaviorSubject<Transaccion[]>([]);
  });

  it('debe mostrar encabezado del historial', async () => {
    await setupComponent();
    expect(screen.getByRole('heading', { name: /historial de movimientos/i })).toBeTruthy();
  });

  it('debe mostrar mensaje cuando no hay transacciones', async () => {
    await setupComponent();
    expect(screen.getByText(/aún no tienes movimientos/i)).toBeTruthy();
  });

  it('debe mostrar tabla con transacciones', async () => {
    await setupComponent([crearTransaccionMock()]);

    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getByText('FPV_BTG')).toBeTruthy();
    expect(screen.getByText('Suscripción')).toBeTruthy();
  });

  it('debe mostrar columnas correctas en el encabezado', async () => {
    await setupComponent();

    expect(screen.getByRole('columnheader', { name: /fecha/i })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: /fondo/i })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: /tipo/i })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: /monto/i })).toBeTruthy();
  });

  it('debe mostrar ambos tipos de transacción en la tabla', async () => {
    await setupComponent([
      crearTransaccionMock(),
      crearTransaccionMock({ id: 'tx2', tipo: 'Cancelación' })
    ]);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveSize(3);
    expect(screen.getByText('Suscripción')).toBeTruthy();
    expect(screen.getByText('Cancelación')).toBeTruthy();
  });

  it('debe mostrar monto con signo negativo para suscripción', async () => {
    await setupComponent([crearTransaccionMock({ monto: 100000 })]);
    expect(screen.getByText(/-\s*\$\s*100[.,]000/)).toBeTruthy();
  });

  it('debe mostrar monto con signo positivo para cancelación', async () => {
    await setupComponent([
      crearTransaccionMock({ id: 'tx2', tipo: 'Cancelación', monto: 75000 })
    ]);
    expect(screen.getByText(/\+\s*\$\s*75[.,]000/)).toBeTruthy();
  });
});
