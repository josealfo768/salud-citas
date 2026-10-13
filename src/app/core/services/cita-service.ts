import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { Cita } from '../models/cita';
import { CITAS } from '../data/mock-data';

export interface DatosCita {
  pacienteId: number;
  medicoId: number;
  sedeId: number;
  fechaHora: string; // 'YYYY-MM-DDTHH:mm:00'
}

@Injectable({ providedIn: 'root' })
export class CitaService {
  private readonly retraso = 600;
  private readonly horasDelDia = this.generarHoras();

  // Estado local: siempre se reemplaza con una copia nueva, nunca se modifica en sitio
  private readonly citasSubject = new BehaviorSubject<Cita[]>(CITAS);

  getHorariosDisponibles(medicoId: number, fecha: string): Observable<string[]> {
    return of(null).pipe(
      delay(this.retraso),
      map((): string[] => {
        // Sin atención sábados ni domingos
        const dia = new Date(`${fecha}T00:00:00`).getDay();
        if (dia === 0 || dia === 6) {
          return [];
        }

        const ocupadas = this.citasSubject.value
          .filter(
            (c) =>
              c.medicoId === medicoId &&
              c.estado === 'programada' &&
              c.fechaHora.startsWith(fecha)
          )
          .map((c) => c.fechaHora.substring(11, 16));

        const ahora = new Date();
        return this.horasDelDia.filter(
          (h) => !ocupadas.includes(h) && new Date(`${fecha}T${h}:00`) > ahora
        );
      })
    );
  }

  getCitasPaciente(pacienteId: number): Observable<Cita[]> {
    return of(null).pipe(
      delay(this.retraso),
      map(() =>
        this.citasSubject.value
          .filter((c) => c.pacienteId === pacienteId)
          .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))
      )
    );
  }

  agendar(datos: DatosCita): Observable<Cita> {
    return of(null).pipe(
      delay(this.retraso),
      map(() => {
        const ocupada = this.citasSubject.value.some(
          (c) =>
            c.medicoId === datos.medicoId &&
            c.estado === 'programada' &&
            c.fechaHora === datos.fechaHora
        );
        if (ocupada) {
          throw new Error('Ese horario ya fue tomado, elige otro');
        }

        const nueva: Cita = {
          citaId: Math.max(0, ...this.citasSubject.value.map((c) => c.citaId)) + 1,
          ...datos,
          estado: 'programada',
        };
        this.citasSubject.next([...this.citasSubject.value, nueva]);
        return nueva;
      })
    );
  }

  cancelar(citaId: number): Observable<Cita> {
    return of(null).pipe(
      delay(this.retraso),
      map(() => {
        const cita = this.citasSubject.value.find((c) => c.citaId === citaId);
        if (!cita) {
          throw new Error('La cita no existe');
        }
        if (cita.estado !== 'programada') {
          throw new Error('Solo se pueden cancelar citas programadas');
        }
        if (new Date(cita.fechaHora) <= new Date()) {
          throw new Error('No se puede cancelar una cita que ya pasó');
        }

        const cancelada: Cita = { ...cita, estado: 'cancelada' };
        this.citasSubject.next(
          this.citasSubject.value.map((c) => (c.citaId === citaId ? cancelada : c))
        );
        return cancelada;
      })
    );
  }

  // Horario de atención: 8:00 a 12:00 y 2:00 a 5:00 pm, cada 30 minutos
  private generarHoras(): string[] {
    const horas: string[] = [];
    for (let h = 8; h < 17; h++) {
      if (h === 12 || h === 13) {
        continue;
      }
      for (const minutos of ['00', '30']) {
        horas.push(`${String(h).padStart(2, '0')}:${minutos}`);
      }
    }
    return horas;
  }
}