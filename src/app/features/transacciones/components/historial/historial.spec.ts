import { render, screen, within } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

import { HistorialComponent } from './historial';
import { FondoService } from '@core/services/fondos-service';
import { Transaccion } from '@core/models/transaccion.interface';

describe('HistorialComponent', () => {
  const transaccionesSubject = new BehaviorSubject<Transaccion[]>([]);
  const transaccionMock: Transaccion = {
    id: 'tx1', fondoId: '1', nombreFondo: 'FPV_BTG',
    tipo: 'Suscripción', monto: 100000, fecha: new Date(), metodoNotificacion: 'email'
  };

  const setupComponent = async () => {
    const fondoServiceSpy = jasmine.createSpyObj('FondoService', [], {
      transacciones$: transaccionesSubject.asObservable()
    });

    return await render(HistorialComponent, {
      providers: [{ provide: FondoService, useValue: fondoServiceSpy }]
    });
  };

  afterEach(() => transaccionesSubject.next([]));

  it('debe mostrar encabezado del historial', async () => {
    await setupComponent();
    
    expect(screen.getByRole('heading', { name: /historial de movimientos/i })).toBeTruthy();
  });

  it('debe mostrar mensaje cuando no hay transacciones', async () => {
    await setupComponent();
    
    expect(screen.getByText(/no hay transacciones registradas/i)).toBeTruthy();
  });

  it('debe mostrar tabla con transacciones', async () => {
    transaccionesSubject.next([transaccionMock]);
    await setupComponent();
    
    const table = screen.getByRole('table');
    expect(table).toBeTruthy();
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

  it('debe diferenciar visualmente suscripción y cancelación', async () => {
    transaccionesSubject.next([
      transaccionMock,
      { ...transaccionMock, id: 'tx2', tipo: 'Cancelación' }
    ]);
    const { fixture } = await setupComponent();
    
    const rows = screen.getAllByRole('row');
    // Primera fila es el header, segunda y tercera son las transacciones
    expect(rows.length).toBe(3);
    expect(screen.getByText('Suscripción')).toBeTruthy();
    expect(screen.getByText('Cancelación')).toBeTruthy();
  });

  it('debe mostrar signo negativo para suscripción y positivo para cancelación', async () => {
    transaccionesSubject.next([
      transaccionMock,
      { ...transaccionMock, id: 'tx2', tipo: 'Cancelación', monto: 100000 }
    ]);
    await setupComponent();
    
    // Verificamos que ambos signos estén presentes
    const celdas = screen.getAllByRole('cell');
    const textoCompleto = celdas.map((c: HTMLElement) => c.textContent).join(' ');
    expect(textoCompleto).toContain('-');
    expect(textoCompleto).toContain('+');
  });
});
