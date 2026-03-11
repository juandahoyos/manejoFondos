import { Component, OnInit, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FondoService } from '@core/services/fondos-service';
import { Fondo } from '@core/models/fondo.interface';
import { NotificacionService } from '@shared/services/notificacion.service';


@Component({
  selector: 'app-lista-fondos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lista-fondos.html',
  styleUrl: './lista-fondos.css'
})
export class ListaFondosComponent implements OnInit, AfterViewChecked {
  private readonly fondoService = inject(FondoService);
  private readonly fb = inject(FormBuilder);
  private readonly notificacionService = inject(NotificacionService);

  // Referencias para accesibilidad del modal
  @ViewChild('montoInput') montoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('modalContenido') modalContenido!: ElementRef<HTMLDivElement>;
  @ViewChild('btnCancelar') btnCancelar!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnConfirmar') btnConfirmar!: ElementRef<HTMLButtonElement>;

  private botonQueAbrioModal: HTMLElement | null = null;
  private modalRecienAbierto = false;

  fondosDisponibles: Fondo[] = [];
  estadoUsuario$ = this.fondoService.estadoUsuario$;

  cargando = true;
  procesando = false;
  mensajeError = '';
  fondoSeleccionado: Fondo | null = null;

  formularioSuscripcion: FormGroup = this.fb.group({
    monto: ['', [Validators.required]],
    notificacion: ['email', Validators.required]
  });

  ngOnInit(): void {
    this.fondoService.obtenerFondosDisponibles().subscribe({
      next: (fondos) => {
        this.fondosDisponibles = fondos;
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'Error al cargar los fondos disponibles.';
        this.cargando = false;
      }
    });
  }

  ngAfterViewChecked(): void {
    // Auto-focus en el input de monto cuando se abre el modal
    if (this.modalRecienAbierto && this.montoInput) {
      this.montoInput.nativeElement.focus();
      this.modalRecienAbierto = false;
    }
  }

  abrirModalSuscripcion(fondo: Fondo, event?: Event): void {
    // Guardar referencia del botón para devolver el foco al cerrar
    this.botonQueAbrioModal = event?.target as HTMLElement;
    this.modalRecienAbierto = true;
    this.mensajeError = '';
    this.fondoSeleccionado = fondo;
    // Configuramos validación dinámica según el fondo seleccionado
    this.formularioSuscripcion.get('monto')?.setValidators([
      Validators.required,
      Validators.min(fondo.montoMinimo)
    ]);
    this.formularioSuscripcion.patchValue({
      monto: fondo.montoMinimo,
      notificacion: 'email'
    });
  }

  cerrarModal(): void {
    this.fondoSeleccionado = null;
    this.formularioSuscripcion.reset();
    // Devolver el foco al botón que abrió el modal
    if (this.botonQueAbrioModal) {
      setTimeout(() => this.botonQueAbrioModal?.focus(), 0);
      this.botonQueAbrioModal = null;
    }
  }

  /** Cierra el modal si se hace click en el backdrop (fuera del contenido) */
  cerrarModalConBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrarModal();
    }
  }

  /** Manejo de teclado para accesibilidad: Escape cierra, Tab hace focus trap */
  manejarTecladoModal(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cerrarModal();
      return;
    }

    // Focus trap: mantener el foco dentro del modal
    if (event.key === 'Tab' && this.modalContenido) {
      const focusableElements = this.modalContenido.nativeElement.querySelectorAll(
        'input, select, button:not([disabled])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  procesarSuscripcion(): void {
    if (this.formularioSuscripcion.valid && this.fondoSeleccionado) {
      this.procesando = true;
      this.mensajeError = '';

      const { monto, notificacion } = this.formularioSuscripcion.value;

      const nombreFondo = this.fondoSeleccionado.nombre;
      this.fondoService.suscribirseAFondo(this.fondoSeleccionado, monto, notificacion).subscribe({
        next: () => {
          this.procesando = false;
          this.cerrarModal();
          this.notificacionService.exito(`Te has vinculado exitosamente al fondo ${nombreFondo}`);
        },
        error: (err) => {
          this.procesando = false;
          this.mensajeError = err.message;
          this.cerrarModal();
        }
      });
    }
  }

  cancelarSuscripcion(fondoId: string): void {
    const fondo = this.fondosDisponibles.find(f => f.id === fondoId);
    this.fondoService.cancelarSuscripcion(fondoId).subscribe({
      next: () => {
        this.notificacionService.exito(`Has cancelado tu vinculación al fondo ${fondo?.nombre}`);
      }
    });
  }
}