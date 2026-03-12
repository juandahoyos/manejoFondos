import { render, screen } from '@testing-library/angular';
import { BehaviorSubject, of } from 'rxjs';
import { Component } from '@angular/core';
import { AsyncPipe, CommonModule, CurrencyPipe } from '@angular/common';

import { PanelPrincipalComponent } from './panel-principal';
import { FondoService } from '@core/services/fondos-service';
import { EstadoUsuario } from '@core/models/estadoUsuario.interface';
import { Transaccion } from '@core/models/transaccion.interface';

@Component({ selector: 'app-lista-fondos', template: '', standalone: true })
class MockListaFondosComponent {}
@Component({ selector: 'app-historial', template: '', standalone: true })
class MockHistorialComponent {}
@Component({ selector: 'app-toast', template: '', standalone: true })
class MockToastComponent {}

describe('PanelPrincipalComponent', () => {
  let estadoUsuarioSubject: BehaviorSubject<EstadoUsuario>;

  const crearEstadoMock = (overrides: Partial<EstadoUsuario> = {}): EstadoUsuario => ({
    saldo: 500000,
    fondosSuscritos: [],
    ...overrides
  });

  const setupComponent = async (estadoInicial?: Partial<EstadoUsuario>) => {
    if (estadoInicial) {
      estadoUsuarioSubject.next(crearEstadoMock(estadoInicial));
    }

    const fondoServiceSpy = jasmine.createSpyObj('FondoService', ['obtenerFondosDisponibles'], { 
      estadoUsuario$: estadoUsuarioSubject.asObservable(),
      transacciones$: new BehaviorSubject<Transaccion[]>([]).asObservable()
    });
    fondoServiceSpy.obtenerFondosDisponibles.and.returnValue(of([]));

    return await render(PanelPrincipalComponent, {
      componentProperties: {},
      imports: [CommonModule, AsyncPipe, CurrencyPipe, MockListaFondosComponent, MockHistorialComponent, MockToastComponent],
      providers: [{ provide: FondoService, useValue: fondoServiceSpy }]
    });
  };

  beforeEach(() => {
    estadoUsuarioSubject = new BehaviorSubject<EstadoUsuario>(crearEstadoMock());
  });

  it('debe crear el componente y mostrar el saldo', async () => {
    await setupComponent();

    expect(screen.getByText(/saldo disponible/i)).toBeTruthy();
    expect(screen.getByText(/500,000/)).toBeTruthy();
  });

  it('debe actualizar el saldo cuando cambia', async () => {
    const { fixture } = await setupComponent();

    estadoUsuarioSubject.next(crearEstadoMock({ saldo: 400000, fondosSuscritos: ['1'] }));
    fixture.detectChanges();

    expect(screen.getByText(/400,000/)).toBeTruthy();
  });

  it('debe mostrar navegación con marca BTG', async () => {
    await setupComponent();

    expect(screen.getByRole('navigation', { name: /navegación principal/i })).toBeTruthy();
    expect(screen.getByText(/pactual/i)).toBeTruthy();
  });

  it('debe tener regiones de contenido accesibles', async () => {
    await setupComponent();

    expect(screen.getByRole('region', { name: /lista de fondos/i })).toBeTruthy();
    expect(screen.getByRole('region', { name: /historial de transacciones/i })).toBeTruthy();
  });
});
