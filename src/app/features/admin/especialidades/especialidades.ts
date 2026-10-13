import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { CatalogoService } from '../../../core/services/catalogo-service';
import { Especialidad } from '../../../core/models/especialidad';

@Component({
  selector: 'app-especialidades',
  standalone: false,
  templateUrl: './especialidades.html',
  styleUrl: './especialidades.scss',
})
export class Especialidades implements OnInit {
  private fb = inject(FormBuilder);
  private catalogo = inject(CatalogoService);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
  });

  cargando = signal(true);
  guardando = signal(false);
  eliminando = signal(false);
  error = signal('');
  exito = signal('');

  items = signal<Especialidad[]>([]);
  editandoId = signal<number | null>(null);
  busqueda = signal('');
  aEliminar = signal<Especialidad | null>(null);

  filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return this.items().filter((e) => !texto || e.nombre.toLowerCase().includes(texto));
  });

  mensajeEliminar = computed(() => {
    const e = this.aEliminar();
    return e ? `¿Seguro que quieres eliminar la especialidad "${e.nombre}"?` : '';
  });

  ngOnInit(): void {
    this.catalogo.getEspecialidades().subscribe({
      next: (lista) => {
        this.items.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las especialidades. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  editar(item: Especialidad): void {
    this.error.set('');
    this.exito.set('');
    this.editandoId.set(item.especialidadId);
    this.form.setValue({ nombre: item.nombre });
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
      this.catalogo.actualizarEspecialidad(id, datos).subscribe({
        next: (actualizada) => {
          // Inmutabilidad: reemplazamos la lista con una copia nueva
          this.items.update((lista) =>
            lista.map((e) => (e.especialidadId === actualizada.especialidadId ? actualizada : e))
          );
          this.terminarGuardado('La especialidad fue actualizada correctamente');
        },
        error: (e: Error) => this.fallarGuardado(e),
      });
    } else {
      this.catalogo.crearEspecialidad(datos).subscribe({
        next: (nueva) => {
          this.items.update((lista) => [...lista, nueva]);
          this.terminarGuardado('La especialidad fue creada correctamente');
        },
        error: (e: Error) => this.fallarGuardado(e),
      });
    }
  }

  pedirEliminar(item: Especialidad): void {
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

    this.catalogo.eliminarEspecialidad(item.especialidadId).subscribe({
      next: () => {
        this.items.update((lista) => lista.filter((e) => e.especialidadId !== item.especialidadId));
        if (this.editandoId() === item.especialidadId) {
          this.cancelarEdicion();
        }
        this.eliminando.set(false);
        this.aEliminar.set(null);
        this.exito.set('La especialidad fue eliminada correctamente');
      },
      error: (e: Error) => {
        this.eliminando.set(false);
        this.aEliminar.set(null);
        this.error.set(e.message);
      },
    });
  }

  invalido(): boolean {
    const c = this.form.controls.nombre;
    return c.invalid && (c.touched || c.dirty);
  }

  mensajeError(): string {
    const c = this.form.controls.nombre;
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