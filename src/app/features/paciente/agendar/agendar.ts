import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../core/services/auth-service';
import { CatalogoService } from '../../../core/services/catalogo-service';
import { CitaService } from '../../../core/services/cita-service';
import { Especialidad } from '../../../core/models/especialidad';
import { Sede } from '../../../core/models/sede';
import { Medico } from '../../../core/models/medico';

@Component({
  selector: 'app-agendar',
  standalone: false,
  templateUrl: './agendar.html',
  styleUrl: './agendar.scss',
})
export class Agendar implements OnInit {
  private auth = inject(AuthService);
  private catalogo = inject(CatalogoService);
  private citaService = inject(CitaService);
  private router = inject(Router);

  readonly pasos = ['Especialidad y sede', 'Médico', 'Fecha y hora', 'Confirmar'];
  readonly minFecha = this.hoy();

  paso = signal(1);
  cargando = signal(true);
  cargandoMedicos = signal(false);
  cargandoHorarios = signal(false);
  guardando = signal(false);
  error = signal('');

  especialidades = signal<Especialidad[]>([]);
  sedes = signal<Sede[]>([]);
  medicos = signal<Medico[]>([]);
  horarios = signal<string[]>([]);

  especialidadId = signal<number | null>(null);
  sedeId = signal<number | null>(null);
  medicoId = signal<number | null>(null);
  fecha = signal('');
  hora = signal('');

  especialidadSel = computed(() =>
    this.especialidades().find((e) => e.especialidadId === this.especialidadId())
  );
  sedeSel = computed(() => this.sedes().find((s) => s.sedeId === this.sedeId()));
  medicoSel = computed(() => this.medicos().find((m) => m.medicoId === this.medicoId()));
  fechaHora = computed(() => `${this.fecha()}T${this.hora()}:00`);

  ngOnInit(): void {
    forkJoin({
      especialidades: this.catalogo.getEspecialidades(),
      sedes: this.catalogo.getSedes(),
    }).subscribe({
      next: ({ especialidades, sedes }) => {
        this.especialidades.set(especialidades);
        this.sedes.set(sedes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  // ---- Paso 1 ----
  onEspecialidad(valor: string): void {
    this.especialidadId.set(valor ? +valor : null);
    this.reiniciarDesdeMedico();
  }

  onSede(valor: string): void {
    this.sedeId.set(valor ? +valor : null);
    this.reiniciarDesdeMedico();
  }

  irAMedicos(): void {
    const especialidadId = this.especialidadId();
    const sedeId = this.sedeId();
    if (!especialidadId || !sedeId) {
      return;
    }
    this.error.set('');
    this.paso.set(2);
    this.cargandoMedicos.set(true);

    this.catalogo.getMedicos({ especialidadId, sedeId }).subscribe({
      next: (medicos) => {
        this.medicos.set(medicos);
        this.cargandoMedicos.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los médicos.');
        this.cargandoMedicos.set(false);
      },
    });
  }

  // ---- Paso 2 ----
  elegirMedico(id: number): void {
    this.medicoId.set(id);
    this.fecha.set('');
    this.hora.set('');
    this.horarios.set([]);
    this.paso.set(3);
  }

  // ---- Paso 3 ----
  onFecha(valor: string): void {
    this.fecha.set(valor);
    this.hora.set('');
    this.horarios.set([]);
    if (valor) {
      this.cargarHorarios();
    }
  }

  elegirHora(h: string): void {
    this.hora.set(h);
  }

  irAConfirmar(): void {
    if (this.fecha() && this.hora()) {
      this.paso.set(4);
    }
  }

  // ---- Paso 4 ----
  confirmar(): void {
    const pacienteId = this.auth.sesionActual?.paciente?.pacienteId;
    const medicoId = this.medicoId();
    const sedeId = this.sedeId();
    if (!pacienteId || !medicoId || !sedeId) {
      this.error.set('Faltan datos para agendar la cita.');
      return;
    }

    this.guardando.set(true);
    this.error.set('');

    this.citaService
      .agendar({ pacienteId, medicoId, sedeId, fechaHora: this.fechaHora() })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.router.navigate(['/paciente/mis-citas'], {
            state: { exito: 'Tu cita fue agendada correctamente' },
          });
        },
        error: (e: Error) => {
          this.guardando.set(false);
          this.error.set(e.message);
          // Si el horario se ocupó, volvemos a elegirlo con la lista actualizada
          this.hora.set('');
          this.paso.set(3);
          this.cargarHorarios();
        },
      });
  }

  // ---- Navegación ----
  atras(): void {
    this.error.set('');
    this.paso.update((p) => Math.max(1, p - 1));
  }

  private cargarHorarios(): void {
    const medicoId = this.medicoId();
    if (!medicoId || !this.fecha()) {
      return;
    }
    this.cargandoHorarios.set(true);
    this.citaService.getHorariosDisponibles(medicoId, this.fecha()).subscribe({
      next: (horarios) => {
        this.horarios.set(horarios);
        this.cargandoHorarios.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los horarios.');
        this.cargandoHorarios.set(false);
      },
    });
  }

  private reiniciarDesdeMedico(): void {
    this.medicos.set([]);
    this.medicoId.set(null);
    this.fecha.set('');
    this.hora.set('');
    this.horarios.set([]);
  }

  private hoy(): string {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }
}