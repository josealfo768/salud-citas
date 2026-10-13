import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { CatalogoService } from '../../../core/services/catalogo-service';
import { Medico } from '../../../core/models/medico';
import { Especialidad } from '../../../core/models/especialidad';
import { Sede } from '../../../core/models/sede';

type FiltroEstado = 'todos' | 'activos' | 'inactivos';

@Component({
  selector: 'app-medicos',
  standalone: false,
  templateUrl: './medicos.html',
  styleUrl: './medicos.scss',
})
export class Medicos implements OnInit {
  private catalogo = inject(CatalogoService);

  cargando = signal(true);
  procesando = signal(false);
  error = signal('');
  exito = signal('');

  medicos = signal<Medico[]>([]);
  especialidades = signal<Especialidad[]>([]);
  sedes = signal<Sede[]>([]);

  busqueda = signal('');
  especialidadFiltro = signal(0);
  estadoFiltro = signal<FiltroEstado>('todos');
  medicoACambiar = signal<Medico | null>(null);

  filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const especialidadId = this.especialidadFiltro();
    const estado = this.estadoFiltro();

    return this.medicos().filter((m) => {
      const coincideTexto = !texto || `${m.nombres} ${m.apellidos}`.toLowerCase().includes(texto);
      const coincideEsp = !especialidadId || m.especialidadId === especialidadId;
      const coincideEstado =
        estado === 'todos' || (estado === 'activos' ? m.activo : !m.activo);
      return coincideTexto && coincideEsp && coincideEstado;
    });
  });

  tituloCambio = computed(() =>
    this.medicoACambiar()?.activo ? 'Desactivar médico' : 'Activar médico'
  );

  mensajeCambio = computed(() => {
    const m = this.medicoACambiar();
    if (!m) {
      return '';
    }
    const nombre = `${m.nombres} ${m.apellidos}`;
    return m.activo
      ? `¿Desactivar a ${nombre}? Dejará de aparecer a los pacientes al agendar citas.`
      : `¿Activar a ${nombre}? Volverá a estar disponible para agendar citas.`;
  });

  textoConfirmarCambio = computed(() => (this.medicoACambiar()?.activo ? 'Sí, desactivar' : 'Sí, activar'));

  ngOnInit(): void {
    this.leerMensajeDeNavegacion();

    forkJoin({
      medicos: this.catalogo.getMedicos({}, false),
      especialidades: this.catalogo.getEspecialidades(),
      sedes: this.catalogo.getSedes(),
    }).subscribe({
      next: ({ medicos, especialidades, sedes }) => {
        this.medicos.set(medicos);
        this.especialidades.set(especialidades);
        this.sedes.set(sedes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de médicos. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  nombreEspecialidad(id: number): string {
    return this.especialidades().find((e) => e.especialidadId === id)?.nombre ?? '-';
  }

  nombresSedes(ids: number[]): string {
    return this.sedes()
      .filter((s) => ids.includes(s.sedeId))
      .map((s) => s.nombre)
      .join(', ');
  }

  pedirCambio(medico: Medico): void {
    this.error.set('');
    this.exito.set('');
    this.medicoACambiar.set(medico);
  }

  cerrarModal(): void {
    if (!this.procesando()) {
      this.medicoACambiar.set(null);
    }
  }

  confirmarCambio(): void {
    const medico = this.medicoACambiar();
    if (!medico || this.procesando()) {
      return;
    }
    this.procesando.set(true);

    this.catalogo.cambiarEstadoMedico(medico.medicoId, !medico.activo).subscribe({
      next: (actualizado) => {
        // Inmutabilidad: reemplazamos la lista con una copia nueva
        this.medicos.update((lista) =>
          lista.map((m) => (m.medicoId === actualizado.medicoId ? actualizado : m))
        );
        this.procesando.set(false);
        this.medicoACambiar.set(null);
        this.exito.set(
          actualizado.activo ? 'El médico fue activado correctamente' : 'El médico fue desactivado correctamente'
        );
      },
      error: (e: Error) => {
        this.procesando.set(false);
        this.medicoACambiar.set(null);
        this.error.set(e.message);
      },
    });
  }

  // Recoge el mensaje de éxito que envía el formulario y lo borra del historial del navegador
  private leerMensajeDeNavegacion(): void {
    const { exito, ...resto } = history.state ?? {};
    if (exito) {
      this.exito.set(exito);
      history.replaceState(resto, '');
    }
  }
}