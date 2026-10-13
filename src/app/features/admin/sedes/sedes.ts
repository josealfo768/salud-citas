import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { CatalogoService } from '../../../core/services/catalogo-service';
import { Sede } from '../../../core/models/sede';

@Component({
  selector: 'app-sedes',
  standalone: false,
  templateUrl: './sedes.html',
  styleUrl: './sedes.scss',
})
export class Sedes implements OnInit {
  private fb = inject(FormBuilder);
  private catalogo = inject(CatalogoService);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    direccion: ['', [Validators.required, Validators.minLength(5)]],
  });

  cargando = signal(true);
  guardando = signal(false);
  eliminando = signal(false);
  error = signal('');
  exito = signal('');

  items = signal<Sede[]>([]);
  editandoId = signal<number | null>(null);
  busqueda = signal('');
  aEliminar = signal<Sede | null>(null);

  filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return this.items().filter(
      (s) => !texto || `${s.nombre} ${s.direccion}`.toLowerCase().includes(texto)
    );
  });

  mensajeEliminar = computed(() => {
    const s = this.aEliminar();
    return s ? `¿Seguro que quieres eliminar la sede "${s.nombre}"?` : '';
  });

  ngOnInit(): void {
    this.catalogo.getSedes().subscribe({
      next: (lista) => {
        this.items.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las sedes. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  editar(item: Sede): void {
    this.error.set('');
    this.exito.set('');
    this.editandoId.set(item.sedeId);
    this.form.setValue({ nombre: item.nombre, direccion: item.direccion });
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.form.reset();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.exito.set('');

    const datos = this.form.getRawValue();
    const id = this.editandoId();

    if (id !== null) {
      this.catalogo.actualizarSede(id, datos).subscribe({
        next: (actualizada) => {
          // Inmutabilidad: reemplazamos la lista con una copia nueva
          this.items.update((lista) =>
            lista.map((s) => (s.sedeId === actualizada.sedeId ? actualizada : s))
          );
          this.terminarGuardado('La sede fue actualizada correctamente');
        },
        error: (e: Error) => this.fallarGuardado(e),
      });
    } else {
      this.catalogo.crearSede(datos).subscribe({
        next: (nueva) => {
          this.items.update((lista) => [...lista, nueva]);
          this.terminarGuardado('La sede fue creada correctamente');
        },
        error: (e: Error) => this.fallarGuardado(e),
      });
    }
  }

  pedirEliminar(item: Sede): void {
    this.error.set('');
    this.exito.set('');
    this.aEliminar.set(item);
  }

  cerrarModal(): void {
    if (!this.eliminando()) {
      this.aEliminar.set(null);
    }
  }

  confirmarEliminar(): void {
    const item = this.aEliminar();
    if (!item || this.eliminando()) {
      return;
    }
    this.eliminando.set(true);

    this.catalogo.eliminarSede(item.sedeId).subscribe({
      next: () => {
        this.items.update((lista) => lista.filter((s) => s.sedeId !== item.sedeId));
        if (this.editandoId() === item.sedeId) {
          this.cancelarEdicion();
        }
        this.eliminando.set(false);
        this.aEliminar.set(null);
        this.exito.set('La sede fue eliminada correctamente');
      },
      error: (e: Error) => {
        this.eliminando.set(false);
        this.aEliminar.set(null);
        this.error.set(e.message);
      },
    });
  }

  invalido(nombre: 'nombre' | 'direccion'): boolean {
    const c = this.form.controls[nombre];
    return c.invalid && (c.touched || c.dirty);
  }

  mensajeError(nombre: 'nombre' | 'direccion'): string {
    const c = this.form.controls[nombre];
    if (c.hasError('required')) return 'Este campo es obligatorio';
    if (c.hasError('minlength')) return `Mínimo ${c.errors?.['minlength'].requiredLength} caracteres`;
    return '';
  }

  private terminarGuardado(mensaje: string): void {
    this.guardando.set(false);
    this.cancelarEdicion();
    this.exito.set(mensaje);
  }

  private fallarGuardado(e: Error): void {
    this.guardando.set(false);
    this.error.set(e.message);
  }
}
