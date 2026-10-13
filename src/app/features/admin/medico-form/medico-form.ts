import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';

import { CatalogoService } from '../../../core/services/catalogo-service';
import { Especialidad } from '../../../core/models/especialidad';
import { Sede } from '../../../core/models/sede';

@Component({
  selector: 'app-medico-form',
  standalone: false,
  templateUrl: './medico-form.html',
  styleUrl: './medico-form.scss',
})
export class MedicoForm implements OnInit {
  private fb = inject(FormBuilder);
  private catalogo = inject(CatalogoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private medicoId: number | null = null;

  form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    especialidadId: [0, [Validators.min(1)]],
    sedeIds: [[] as number[], [Validators.required]],
  });

  cargando = signal(true);
  guardando = signal(false);
  error = signal('');
  esEdicion = signal(false);

  especialidades = signal<Especialidad[]>([]);
  sedes = signal<Sede[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.medicoId = id ? +id : null;
    this.esEdicion.set(this.medicoId !== null);

    forkJoin({
      especialidades: this.catalogo.getEspecialidades(),
      sedes: this.catalogo.getSedes(),
      medico: this.medicoId !== null ? this.catalogo.getMedico(this.medicoId) : of(null),
    }).subscribe({
      next: ({ especialidades, sedes, medico }) => {
        this.especialidades.set(especialidades);
        this.sedes.set(sedes);
        if (medico) {
          this.form.patchValue({
            nombres: medico.nombres,
            apellidos: medico.apellidos,
            especialidadId: medico.especialidadId,
            sedeIds: medico.sedeIds,
          });
        }
        this.cargando.set(false);
      },
      error: (e: Error) => {
        this.error.set(e.message || 'No se pudo cargar la información.');
        this.cargando.set(false);
      },
    });
  }

  alternarSede(sedeId: number, marcada: boolean): void {
    const control = this.form.controls.sedeIds;
    const actuales = control.value;
    control.setValue(marcada ? [...actuales, sedeId] : actuales.filter((s) => s !== sedeId));
    control.markAsTouched();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    const datos = this.form.getRawValue();
    const operacion =
      this.medicoId !== null
        ? this.catalogo.actualizarMedico(this.medicoId, datos)
        : this.catalogo.crearMedico(datos);

    operacion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/admin/medicos'], {
          state: {
            exito: this.esEdicion()
              ? 'El médico fue actualizado correctamente'
              : 'El médico fue registrado correctamente',
          },
        });
      },
      error: (e: Error) => {
        this.guardando.set(false);
        this.error.set(e.message);
      },
    });
  }

  invalido(nombre: 'nombres' | 'apellidos' | 'especialidadId' | 'sedeIds'): boolean {
    const c = this.form.controls[nombre];
    return c.invalid && (c.touched || c.dirty);
  }

  mensajeError(nombre: 'nombres' | 'apellidos'): string {
    const c = this.form.controls[nombre];
    if (c.hasError('required')) return 'Este campo es obligatorio';
    if (c.hasError('minlength')) return `Mínimo ${c.errors?.['minlength'].requiredLength} caracteres`;
    return '';
  }
}