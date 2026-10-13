import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../core/services/auth-service';
import { CitaService } from '../../../core/services/cita-service';
import { CatalogoService } from '../../../core/services/catalogo-service';
import { Cita } from '../../../core/models/cita';

export interface ProximaCita {
  cita: Cita;
  medico: string;
  sede: string;
}

@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements OnInit {
  private auth = inject(AuthService);
  private citaService = inject(CitaService);
  private catalogo = inject(CatalogoService);

  nombre = this.auth.sesionActual?.paciente?.nombres ?? '';

  cargando = signal(true);
  error = signal('');
  proxima = signal<ProximaCita | null>(null);
  totalProgramadas = signal(0);

  ngOnInit(): void {
    const pacienteId = this.auth.sesionActual?.paciente?.pacienteId;
    if (!pacienteId) {
      this.cargando.set(false);
      this.error.set('No se encontró el perfil del paciente');
      return;
    }

    forkJoin({
      citas: this.citaService.getCitasPaciente(pacienteId),
      medicos: this.catalogo.getMedicos({}, false),
      sedes: this.catalogo.getSedes(),
    }).subscribe({
      next: ({ citas, medicos, sedes }) => {
        const ahora = new Date();
        const futuras = citas.filter(
          (c) => c.estado === 'programada' && new Date(c.fechaHora) > ahora
        );
        this.totalProgramadas.set(futuras.length);

        const primera = futuras[0]; // getCitasPaciente ya las entrega ordenadas por fecha
        if (primera) {
          const medico = medicos.find((m) => m.medicoId === primera.medicoId);
          const sede = sedes.find((s) => s.sedeId === primera.sedeId);
          this.proxima.set({
            cita: primera,
            medico: medico ? `Dr(a). ${medico.nombres} ${medico.apellidos}` : 'Médico',
            sede: sede ? sede.nombre : 'Sede',
          });
        }
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar tu información. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }
}