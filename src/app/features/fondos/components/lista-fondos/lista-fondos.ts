import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core';
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
export class ListaFondosComponent implements OnInit {
  private readonly fondoService = inject(FondoService);
  private readonly fb = inject(FormBuilder);
  private readonly notificacionService = inject(NotificacionService);

  // Referencias para el modal nativo <dialog>
  @ViewChild('dialogModal') dialogModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('montoInput') montoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('modalContenido') modalContenido!: ElementRef<HTMLDivElement>;

  private botonQueAbrioModal: HTMLElement | null = null;

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

  abrirModalSuscripcion(fondo: Fondo, event?: Event): void {
    // Guardar referencia del botón para devolver el foco al cerrar
    this.botonQueAbrioModal = event?.target as HTMLElement;
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
    // Abrir el dialog nativo con showModal() para accesibilidad completa
    this.dialogModal.nativeElement.showModal();
    // Focus en el input de monto
    setTimeout(() => this.montoInput?.nativeElement.focus(), 0);
  }

  cerrarModal(): void {
    // Cerrar el dialog nativo
    if (this.dialogModal?.nativeElement.open) {
      this.dialogModal.nativeElement.close();
    }
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
    // El elemento <dialog> recibe el click cuando se hace click en el backdrop
    const dialogElement = this.dialogModal?.nativeElement;
    if (event.target === dialogElement) {
      this.cerrarModal();
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