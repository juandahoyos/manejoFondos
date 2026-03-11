import { render, screen, fireEvent } from '@testing-library/angular';
import { signal, WritableSignal } from '@angular/core';

import { ToastComponent } from './toast.component';
import { NotificacionService } from '../../services/notificacion.service';
import { Notificacion } from '../../models/notificacion.interface';

describe('ToastComponent', () => {
  let notificacionServiceSpy: jasmine.SpyObj<NotificacionService>;
  let notificacionesMock: WritableSignal<Notificacion[]>;

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
    
    // Verificar que existe el contenedor con aria-live
    expect(container.querySelector('[aria-live="polite"]')).toBeTruthy();
    expect(screen.queryAllByRole('alert').length).toBe(0);
  });

  it('debe mostrar notificaciones con mensaje', async () => {
    await setupComponent([
      { id: '1', mensaje: 'Operación exitosa', tipo: 'exito', duracion: 4000 },
      { id: '2', mensaje: 'Ocurrió un error', tipo: 'error', duracion: 5000 }
    ]);

    expect(screen.getAllByRole('alert').length).toBe(2);
    expect(screen.getByText('Operación exitosa')).toBeTruthy();
    expect(screen.getByText('Ocurrió un error')).toBeTruthy();
  });

  it('debe mostrar botón de cerrar en cada notificación', async () => {
    await setupComponent([
      { id: '1', mensaje: 'Test', tipo: 'info', duracion: 4000 }
    ]);

    const botonCerrar = screen.getByRole('button', { name: /cerrar notificación/i });
    expect(botonCerrar).toBeTruthy();
  });

  it('debe llamar a cerrar() al hacer clic en el botón', async () => {
    await setupComponent([
      { id: 'test-id', mensaje: 'Test', tipo: 'info', duracion: 4000 }
    ]);
    
    const botonCerrar = screen.getByRole('button', { name: /cerrar notificación/i });
    fireEvent.click(botonCerrar);
    
    expect(notificacionServiceSpy.cerrar).toHaveBeenCalledWith('test-id');
  });

  it('debe renderizar diferentes tipos de notificación', async () => {
    const { fixture, rerender } = await setupComponent([
      { id: '1', mensaje: 'Éxito', tipo: 'exito', duracion: 4000 }
    ]);

    let alert = screen.getByRole('alert');
    expect(alert.className).toContain('border-green-200');

    notificacionesMock.set([{ id: '2', mensaje: 'Error', tipo: 'error', duracion: 4000 }]);
    fixture.detectChanges();
    
    alert = screen.getByRole('alert');
    expect(alert.className).toContain('border-red-200');

    notificacionesMock.set([{ id: '3', mensaje: 'Info', tipo: 'info', duracion: 4000 }]);
    fixture.detectChanges();
    
    alert = screen.getByRole('alert');
    expect(alert.className).toContain('border-blue-200');
  });
});
