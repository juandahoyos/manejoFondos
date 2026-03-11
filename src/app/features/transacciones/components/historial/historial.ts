import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FondoService } from '@core/services/fondos-service';


@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class HistorialComponent {
  private readonly fondoService = inject(FondoService);
  transacciones$ = this.fondoService.transacciones$;
}