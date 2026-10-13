import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../core/services/auth-service';
import { CatalogoService } from '../../../core/services/catalogo-service';
import { CitaService } from '../../../core/services/cita-service';
import { CitaVista } from '../components/cita-card/cita-card';

type Filtro = 'proximas' | 'historial' | 'todas';

@Component({
  selector: 'app-mis-citas',
  standalone: false,
  templateUrl: './mis-citas.html',
  styleUrl: './mis-citas.scss',
})
export class MisCitas implements OnInit {
  private auth = inject(AuthService);
  private catalogo = inject(CatalogoService);
  private citaService = inject(CitaService);

  cargando = signal(true);
  cancelando = signal(false);
  error = signal('');
  exito = signal('');

  citas = signal<CitaVista[]>([]);
  filtro = signal<Filtro>('proximas');
  busqueda = signal('');
  citaACancelar = signal<CitaVista | null>(null);

  totalProximas = computed(() => this.citas().filter((v) => v.proxima).length);
  totalHistorial = computed(() => this.citas().filter((v) => !v.proxima).length);

  citasFiltradas = computed(() => {
    const filtro = this.filtro();
    const texto = this.busqueda().trim().toLowerCase();

    const lista = this.citas().filter((v) => {
      const coincideFiltro =
        filtro === 'todas' || (filtro === 'proximas' ? v.proxima : !v.proxima);
      const coincideTexto =
        !texto || `${v.medico} ${v.especialidad} ${v.sede}`.toLowerCase().includes(texto);
      return coincideFiltro && coincideTexto;
    });

    // Próximas: la más cercana primero. Historial y todas: la más reciente primero.
    return [...lista].sort((a, b) =>
      filtro === 'proximas'
        ? a.cita.fechaHora.localeCompare(b.cita.fechaHora)
        : b.cita.fechaHora.localeCompare(a.cita.fechaHora)
    );
  });

  mensajeCancelar = computed(() => {
    const v = this.citaACancelar();
    return v ? `¿Seguro que quieres cancelar tu cita con ${v.medico}? Esta acción no se puede deshacer.` : '';
  });

  ngOnInit(): void {
    this.leerMensajeDeNavegacion();

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
      especialidades: this.catalogo.getEspecialidades(),
    }).subscribe({
      next: ({ citas, medicos, sedes, especialidades }) => {
        const ahora = new Date();
        const vistas = citas.map((cita): CitaVista => {
          const medico = medicos.find((m) => m.medicoId === cita.medicoId);
          const sede = sedes.find((s) => s.sedeId === cita.sedeId);
          const esp = especialidades.find((e) => e.especialidadId === medico?.especialidadId);
          return {
            cita,
            medico: medico ? `Dr(a). ${medico.nombres} ${medico.apellidos}` : 'Médico',
            especialidad: esp?.nombre ?? '',
            sede: sede?.nombre ?? 'Sede',
            proxima: cita.estado === 'programada' && new Date(cita.fechaHora) > ahora,
          };
        });
        this.citas.set(vistas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus citas. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  cambiarFiltro(filtro: Filtro): void {
    this.filtro.set(filtro);
  }

  pedirCancelar(vista: CitaVista): void {
    this.error.set('');
    this.exito.set('');
    this.citaACancelar.set(vista);
  }

  cerrarModal(): void {
    if (!this.cancelando()) {
      this.citaACancelar.set(null);
    }
  }

  confirmarCancelar(): void {
    const vista = this.citaACancelar();
    if (!vista || this.cancelando()) {
      return;
    }
    this.cancelando.set(true);

    this.citaService.cancelar(vista.cita.citaId).subscribe({
      next: (cancelada) => {
        // Inmutabilidad: reemplazamos la lista con una copia nueva
        this.citas.update((lista) =>
          lista.map((v) =>
            v.cita.citaId === cancelada.citaId ? { ...v, cita: cancelada, proxima: false } : v
          )
        );
        this.cancelando.set(false);
        this.citaACancelar.set(null);
        this.exito.set('La cita fue cancelada correctamente');
      },
      error: (e: Error) => {
        this.cancelando.set(false);
        this.citaACancelar.set(null);
        this.error.set(e.message);
      },
    });
  }

  // Recoge el mensaje de éxito que envía la pantalla de agendar y lo borra del historial del navegador
  private leerMensajeDeNavegacion(): void {
    const { exito, ...resto } = history.state ?? {};
    if (exito) {
      this.exito.set(exito);
      history.replaceState(resto, '');
    }
  }
}