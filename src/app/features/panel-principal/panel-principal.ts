import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaFondosComponent } from '../fondos/components/lista-fondos/lista-fondos';
import { HistorialComponent } from '../transacciones/components/historial/historial';
import { FondoService } from '@core/services/fondos-service';
import { ToastComponent } from '@shared/components/toast/toast.component';

@Component({
  selector: 'app-panel-principal',
  standalone: true,
  imports: [CommonModule, ListaFondosComponent, HistorialComponent, ToastComponent],
  templateUrl: './panel-principal.html',
  styleUrl: './panel-principal.css'
})
export class PanelPrincipalComponent {
  private readonly fondoService = inject(FondoService);
  estadoUsuario$ = this.fondoService.estadoUsuario$;
}