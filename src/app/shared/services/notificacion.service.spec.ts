import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificacionService } from './notificacion.service';

describe('NotificacionService', () => {
  let service: NotificacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificacionService);
  });

  it('debe crear el servicio con lista vacía', () => {
    expect(service).toBeTruthy();
    expect(service.notificaciones()).toEqual([]);
  });

  it('debe agregar notificaciones con ID único y auto-cerrar', fakeAsync(() => {
    service.mostrar('Mensaje 1', 'info', 2000);
    service.mostrar('Mensaje 2', 'error', 3000);
    
    const notificaciones = service.notificaciones();
    expect(notificaciones.length).toBe(2);
    expect(notificaciones[0].id).not.toBe(notificaciones[1].id);
    
    tick(2000);
    expect(service.notificaciones().length).toBe(1);
    
    tick(1000);
    expect(service.notificaciones().length).toBe(0);
  }));

  it('debe crear notificaciones con tipo y duración correctos según método', () => {
    service.exito('Éxito');
    service.error('Error');
    service.info('Info');
    
    const notificaciones = service.notificaciones();
    expect(notificaciones[0]).toEqual(jasmine.objectContaining({ tipo: 'exito', duracion: 4000 }));
    expect(notificaciones[1]).toEqual(jasmine.objectContaining({ tipo: 'error', duracion: 5000 }));
    expect(notificaciones[2]).toEqual(jasmine.objectContaining({ tipo: 'info', duracion: 4000 }));
  });

  it('debe cerrar notificación por ID', () => {
    service.mostrar('Mensaje', 'info');
    const id = service.notificaciones()[0].id;
    
    service.cerrar(id);
    
    expect(service.notificaciones().length).toBe(0);
  });

  it('no debe auto-cerrar si duración es 0', fakeAsync(() => {
    service.mostrar('Permanente', 'info', 0);
    tick(10000);
    expect(service.notificaciones().length).toBe(1);
  }));
});
