import { Component, inject } from '@angular/core';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none" aria-live="polite">
      @for (notificacion of notificacionService.notificaciones(); track notificacion.id) {
        <div 
          class="pointer-events-auto min-w-[320px] max-w-md p-4 rounded-lg shadow-lg border flex items-start gap-3 animate-slide-in"
          [class]="getClases(notificacion.tipo)"
          role="alert">
          
          <!-- Icono -->
          <div class="shrink-0">
            @switch (notificacion.tipo) {
              @case ('exito') {
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              }
              @case ('error') {
                <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
              }
              @case ('info') {
                <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
              }
            }
          </div>

          <!-- Mensaje -->
          <p class="flex-1 text-sm font-medium">{{ notificacion.mensaje }}</p>

          <!-- Botón cerrar -->
          <button 
            (click)="notificacionService.cerrar(notificacion.id)"
            class="shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
            aria-label="Cerrar notificación">
            <svg class="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class ToastComponent {
  protected readonly notificacionService = inject(NotificacionService);

  getClases(tipo: string): string {
    const base = 'bg-white ';
    switch (tipo) {
      case 'exito':
        return base + 'border-green-200 text-green-800';
      case 'error':
        return base + 'border-red-200 text-red-800';
      case 'info':
        return base + 'border-blue-200 text-blue-800';
      default:
        return base + 'border-gray-200 text-gray-800';
    }
  }
}
