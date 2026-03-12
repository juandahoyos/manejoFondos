import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { ListaFondosComponent } from './lista-fondos';
import { FondoService } from '@core/services/fondos-service';
import { NotificacionService } from '@shared/services/notificacion.service';
import { Fondo } from '@core/models/fondo.interface';
import { EstadoUsuario } from '@core/models/estadoUsuario.interface';

describe('ListaFondosComponent', () => {
  let fondoServiceSpy: jasmine.SpyObj<FondoService>;
  let notificacionServiceSpy: jasmine.SpyObj<NotificacionService>;
  let estadoUsuarioSubject: BehaviorSubject<EstadoUsuario>;

  const crearFondoMock = (overrides: Partial<Fondo> = {}): Fondo => ({
    id: '1',
    nombre: 'FPV_BTG',
    montoMinimo: 75000,
    categoria: 'FPV',
    ...overrides
  });

  const crearEstadoMock = (overrides: Partial<EstadoUsuario> = {}): EstadoUsuario => ({
    saldo: 500000,
    fondosSuscritos: [],
    ...overrides
  });

  const setupComponent = async (fondos: Fondo[] = [crearFondoMock()]) => {
    fondoServiceSpy = jasmine.createSpyObj('FondoService',
      ['obtenerFondosDisponibles', 'suscribirseAFondo', 'cancelarSuscripcion'],
      { estadoUsuario$: estadoUsuarioSubject.asObservable() }
    );
    notificacionServiceSpy = jasmine.createSpyObj('NotificacionService', ['exito', 'error']);
    fondoServiceSpy.obtenerFondosDisponibles.and.returnValue(of(fondos));

    return await render(ListaFondosComponent, {
      imports: [ReactiveFormsModule],
      providers: [
        { provide: FondoService, useValue: fondoServiceSpy },
        { provide: NotificacionService, useValue: notificacionServiceSpy }
      ]
    });
  };

  beforeEach(() => {
    estadoUsuarioSubject = new BehaviorSubject<EstadoUsuario>(crearEstadoMock());
  });

  it('debe mostrar fondos disponibles con botón de vinculación', async () => {
    await setupComponent();

    expect(screen.getByRole('heading', { name: /fondos disponibles/i })).toBeTruthy();
    expect(screen.getByText('FPV_BTG')).toBeTruthy();
    expect(screen.getByRole('button', { name: /vincularse al fondo fpv_btg/i })).toBeTruthy();
  });

  it('debe mostrar notificación de error cuando falla la carga', async () => {
    fondoServiceSpy = jasmine.createSpyObj('FondoService',
      ['obtenerFondosDisponibles', 'suscribirseAFondo', 'cancelarSuscripcion'],
      { estadoUsuario$: estadoUsuarioSubject.asObservable() }
    );
    notificacionServiceSpy = jasmine.createSpyObj('NotificacionService', ['exito', 'error']);
    fondoServiceSpy.obtenerFondosDisponibles.and.returnValue(throwError(() => new Error('Error')));

    await render(ListaFondosComponent, {
      imports: [ReactiveFormsModule],
      providers: [
        { provide: FondoService, useValue: fondoServiceSpy },
        { provide: NotificacionService, useValue: notificacionServiceSpy }
      ]
    });

    expect(notificacionServiceSpy.error).toHaveBeenCalledWith('Error al cargar los fondos disponibles. Intenta nuevamente.');
  });

  it('debe abrir modal de suscripción al hacer clic en Vincularse', async () => {
    await setupComponent();

    const botonVincularse = screen.getByRole('button', { name: /vincularse al fondo fpv_btg/i });
    fireEvent.click(botonVincularse);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
      expect(screen.getByLabelText(/monto a invertir/i)).toBeTruthy();
    });
  });

  it('debe procesar suscripción exitosa', async () => {
    await setupComponent();
    fondoServiceSpy.suscribirseAFondo.and.returnValue(of(true));

    fireEvent.click(screen.getByRole('button', { name: /vincularse al fondo fpv_btg/i }));

    await waitFor(() => screen.getByRole('dialog'));

    const inputMonto = screen.getByLabelText(/monto a invertir/i);
    fireEvent.input(inputMonto, { target: { value: '100000' } });

    const botones = screen.getAllByRole('button');
    const botonConfirmar = botones.find(btn => btn.textContent?.includes('Confirmar'));
    fireEvent.click(botonConfirmar!);

    await waitFor(() => {
      expect(fondoServiceSpy.suscribirseAFondo).toHaveBeenCalled();
      expect(notificacionServiceSpy.exito).toHaveBeenCalled();
    });
  });

  it('debe mostrar botón de cancelar cuando el usuario está suscrito', async () => {
    estadoUsuarioSubject.next(crearEstadoMock({ saldo: 400000, fondosSuscritos: ['1'] }));
    await setupComponent();

    expect(screen.getByRole('button', { name: /cancelar vinculación al fondo fpv_btg/i })).toBeTruthy();
  });

  it('debe cancelar suscripción correctamente', async () => {
    estadoUsuarioSubject.next(crearEstadoMock({ saldo: 400000, fondosSuscritos: ['1'] }));
    await setupComponent();
    fondoServiceSpy.cancelarSuscripcion.and.returnValue(of(true));

    fireEvent.click(screen.getByRole('button', { name: /cancelar vinculación/i }));

    await waitFor(() => {
      expect(fondoServiceSpy.cancelarSuscripcion).toHaveBeenCalledWith('1');
      expect(notificacionServiceSpy.exito).toHaveBeenCalled();
    });
  });

  it('debe mostrar error cuando falla la suscripción', async () => {
    await setupComponent();
    fondoServiceSpy.suscribirseAFondo.and.returnValue(throwError(() => new Error('Saldo insuficiente')));

    fireEvent.click(screen.getByRole('button', { name: /vincularse al fondo fpv_btg/i }));
    await waitFor(() => screen.getByRole('dialog'));

    const inputMonto = screen.getByLabelText(/monto a invertir/i);
    fireEvent.input(inputMonto, { target: { value: '100000' } });

    const botones = screen.getAllByRole('button');
    const botonConfirmar = botones.find(btn => btn.textContent?.includes('Confirmar'));
    fireEvent.click(botonConfirmar!);

    await waitFor(() => {
      expect(notificacionServiceSpy.error).toHaveBeenCalledWith('Saldo insuficiente');
    });
  });

  it('debe mostrar error cuando falla la cancelación', async () => {
    estadoUsuarioSubject.next(crearEstadoMock({ saldo: 400000, fondosSuscritos: ['1'] }));
    await setupComponent();
    fondoServiceSpy.cancelarSuscripcion.and.returnValue(throwError(() => new Error('Error de red')));

    fireEvent.click(screen.getByRole('button', { name: /cancelar vinculación/i }));

    await waitFor(() => {
      expect(notificacionServiceSpy.error).toHaveBeenCalledWith('Error de red');
    });
  });

  it('debe cerrar modal con tecla Escape', async () => {
    await setupComponent();

    fireEvent.click(screen.getByRole('button', { name: /vincularse/i }));
    await waitFor(() => screen.getByRole('dialog'));

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});
