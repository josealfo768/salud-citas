import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { Especialidad } from '../models/especialidad';
import { Sede } from '../models/sede';
import { Medico } from '../models/medico';
import { ESPECIALIDADES, SEDES, MEDICOS } from '../data/mock-data';

export interface FiltroMedicos {
  especialidadId?: number;
  sedeId?: number;
}

export interface DatosMedico {
  especialidadId: number;
  nombres: string;
  apellidos: string;
  sedeIds: number[];
}

export interface DatosEspecialidad {
  nombre: string;
}

export interface DatosSede {
  nombre: string;
  direccion: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly retraso = 600; // milisegundos, simula la espera de una API

  // Estado local: siempre se reemplaza con una copia nueva, nunca se modifica en sitio
  private readonly especialidadesSubject = new BehaviorSubject<Especialidad[]>(ESPECIALIDADES);
  private readonly sedesSubject = new BehaviorSubject<Sede[]>(SEDES);
  private readonly medicosSubject = new BehaviorSubject<Medico[]>(MEDICOS);

  // ---------- Lecturas ----------
  getEspecialidades(): Observable<Especialidad[]> {
    return this.simular(() => [...this.especialidadesSubject.value]);
  }

  getSedes(): Observable<Sede[]> {
    return this.simular(() => [...this.sedesSubject.value]);
  }

  getMedico(medicoId: number): Observable<Medico> {
    return this.simular(() => {
      const medico = this.medicosSubject.value.find((m) => m.medicoId === medicoId);
      if (!medico) {
        throw new Error('El médico no existe');
      }
      return medico;
    });
  }

  getMedicos(filtro: FiltroMedicos = {}, soloActivos = true): Observable<Medico[]> {
    return this.simular(() =>
      this.medicosSubject.value.filter(
        (m) =>
          (!soloActivos || m.activo) &&
          (!filtro.especialidadId || m.especialidadId === filtro.especialidadId) &&
          (!filtro.sedeId || m.sedeIds.includes(filtro.sedeId))
      )
    );
  }

  // ---------- Médicos ----------
  crearMedico(datos: DatosMedico): Observable<Medico> {
    return this.simular(() => {
      const nuevo: Medico = {
        medicoId: this.siguienteId(this.medicosSubject.value.map((m) => m.medicoId)),
        ...datos,
        activo: true,
      };
      this.medicosSubject.next([...this.medicosSubject.value, nuevo]);
      return nuevo;
    });
  }

  actualizarMedico(medicoId: number, datos: DatosMedico): Observable<Medico> {
    return this.simular(() => {
      const actual = this.medicosSubject.value.find((m) => m.medicoId === medicoId);
      if (!actual) {
        throw new Error('El médico no existe');
      }
      const actualizado: Medico = { ...actual, ...datos };
      this.medicosSubject.next(
        this.medicosSubject.value.map((m) => (m.medicoId === medicoId ? actualizado : m))
      );
      return actualizado;
    });
  }

  cambiarEstadoMedico(medicoId: number, activo: boolean): Observable<Medico> {
    return this.simular(() => {
      const actual = this.medicosSubject.value.find((m) => m.medicoId === medicoId);
      if (!actual) {
        throw new Error('El médico no existe');
      }
      const actualizado: Medico = { ...actual, activo };
      this.medicosSubject.next(
        this.medicosSubject.value.map((m) => (m.medicoId === medicoId ? actualizado : m))
      );
      return actualizado;
    });
  }

  // ---------- Especialidades ----------
  crearEspecialidad(datos: DatosEspecialidad): Observable<Especialidad> {
    return this.simular(() => {
      this.validarNombreUnico(this.especialidadesSubject.value.map((e) => e.nombre), datos.nombre);
      const nueva: Especialidad = {
        especialidadId: this.siguienteId(this.especialidadesSubject.value.map((e) => e.especialidadId)),
        nombre: datos.nombre.trim(),
      };
      this.especialidadesSubject.next([...this.especialidadesSubject.value, nueva]);
      return nueva;
    });
  }

  actualizarEspecialidad(id: number, datos: DatosEspecialidad): Observable<Especialidad> {
    return this.simular(() => {
      const otras = this.especialidadesSubject.value.filter((e) => e.especialidadId !== id);
      this.validarNombreUnico(otras.map((e) => e.nombre), datos.nombre);
      const actualizada: Especialidad = { especialidadId: id, nombre: datos.nombre.trim() };
      this.especialidadesSubject.next(
        this.especialidadesSubject.value.map((e) => (e.especialidadId === id ? actualizada : e))
      );
      return actualizada;
    });
  }

  eliminarEspecialidad(id: number): Observable<void> {
    return this.simular(() => {
      if (this.medicosSubject.value.some((m) => m.especialidadId === id)) {
        throw new Error('No se puede eliminar: hay médicos con esta especialidad');
      }
      this.especialidadesSubject.next(
        this.especialidadesSubject.value.filter((e) => e.especialidadId !== id)
      );
    });
  }

  // ---------- Sedes ----------
  crearSede(datos: DatosSede): Observable<Sede> {
    return this.simular(() => {
      this.validarNombreUnico(this.sedesSubject.value.map((s) => s.nombre), datos.nombre);
      const nueva: Sede = {
        sedeId: this.siguienteId(this.sedesSubject.value.map((s) => s.sedeId)),
        nombre: datos.nombre.trim(),
        direccion: datos.direccion.trim(),
      };
      this.sedesSubject.next([...this.sedesSubject.value, nueva]);
      return nueva;
    });
  }

  actualizarSede(id: number, datos: DatosSede): Observable<Sede> {
    return this.simular(() => {
      const otras = this.sedesSubject.value.filter((s) => s.sedeId !== id);
      this.validarNombreUnico(otras.map((s) => s.nombre), datos.nombre);
      const actualizada: Sede = {
        sedeId: id,
        nombre: datos.nombre.trim(),
        direccion: datos.direccion.trim(),
      };
      this.sedesSubject.next(
        this.sedesSubject.value.map((s) => (s.sedeId === id ? actualizada : s))
      );
      return actualizada;
    });
  }

  eliminarSede(id: number): Observable<void> {
    return this.simular(() => {
      if (this.medicosSubject.value.some((m) => m.sedeIds.includes(id))) {
        throw new Error('No se puede eliminar: hay médicos que atienden en esta sede');
      }
      this.sedesSubject.next(this.sedesSubject.value.filter((s) => s.sedeId !== id));
    });
  }

  // ---------- Utilidades privadas ----------
  // Ejecuta la operación después de un retraso, como si fuera una petición HTTP.
  // Si la función lanza un Error, el Observable falla igual que lo haría una API.
  private simular<T>(operacion: () => T): Observable<T> {
    return of(null).pipe(
      delay(this.retraso),
      map(() => operacion())
    );
  }

  private siguienteId(ids: number[]): number {
    return Math.max(0, ...ids) + 1;
  }

  private validarNombreUnico(existentes: string[], nombre: string): void {
    const normalizado = nombre.trim().toLowerCase();
    if (existentes.some((n) => n.trim().toLowerCase() === normalizado)) {
      throw new Error('Ya existe un registro con ese nombre');
    }
  }
}