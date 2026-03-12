import { render, screen, fireEvent } from '@testing-library/angular';
import { signal, WritableSignal } from '@angular/core';

import { ToastComponent } from './toast.component';
import { NotificacionService } from '../../services/notificacion.service';
import { Notificacion } from '../../models/notificacion.interface';

describe('ToastComponent', () => {
  let notificacionServiceSpy: jasmine.SpyObj<NotificacionService>;
  let notificacionesMock: WritableSignal<Notificacion[]>;

  const crearNotificacionMock = (overrides: Partial<Notificacion> = {}): Notificacion => ({
    id: '1',
    mensaje: 'Mensaje de prueba',
    tipo: 'info',
    duracion: 4000,
    ...overrides
  });

  const setupComponent = async (notificaciones: Notificacion[] = []) => {
    notificacionesMock = signal<Notificacion[]>(notificaciones);
    notificacionServiceSpy = jasmine.createSpyObj('NotificacionService', ['cerrar'], {
      notificaciones: notificacionesMock.asReadonly()
    });

    return await render(ToastComponent, {
      providers: [{ provide: NotificacionService, useValue: notificacionServiceSpy }]
    });
  };

  it('debe crear el componente con contenedor accesible', async () => {
    const { container } = await setupComponent();

    expect(container.querySelector('[aria-live="polite"]')).toBeTruthy();
    expect(screen.queryAllByRole('alert')).toHaveSize(0);
  });

  it('debe mostrar notificaciones con mensaje', async () => {
    await setupComponent([
      crearNotificacionMock({ id: '1', mensaje: 'Operación exitosa', tipo: 'exito' }),
      crearNotificacionMock({ id: '2', mensaje: 'Ocurrió un error', tipo: 'error' })
    ]);

    expect(screen.getAllByRole('alert')).toHaveSize(2);
    expect(screen.getByText('Operación exitosa')).toBeTruthy();
    expect(screen.getByText('Ocurrió un error')).toBeTruthy();
  });

  it('debe mostrar botón de cerrar en cada notificación', async () => {
    await setupComponent([crearNotificacionMock()]);

    expect(screen.getByRole('button', { name: /cerrar notificación/i })).toBeTruthy();
  });

  it('debe llamar a cerrar() al hacer clic en el botón', async () => {
    await setupComponent([crearNotificacionMock({ id: 'test-id' })]);

    fireEvent.click(screen.getByRole('button', { name: /cerrar notificación/i }));

    expect(notificacionServiceSpy.cerrar).toHaveBeenCalledWith('test-id');
  });

  it('debe aplicar estilos según el tipo de notificación', async () => {
    const { fixture } = await setupComponent([
      crearNotificacionMock({ tipo: 'exito' })
    ]);

    let alert = screen.getByRole('alert');
    expect(alert.className).toContain('border-green');

    notificacionesMock.set([crearNotificacionMock({ id: '2', tipo: 'error' })]);
    fixture.detectChanges();
    alert = screen.getByRole('alert');
    expect(alert.className).toContain('border-red');

    notificacionesMock.set([crearNotificacionMock({ id: '3', tipo: 'info' })]);
    fixture.detectChanges();
    alert = screen.getByRole('alert');
    expect(alert.className).toContain('border-blue');
  });
});
