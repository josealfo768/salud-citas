import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

import { Usuario } from '../models/usuario';
import { Paciente } from '../models/paciente';
import { USUARIOS, PACIENTES } from '../data/mock-data';

export interface Sesion {
  token: string;
  usuario: Omit<Usuario, 'clave'>;
  paciente?: Paciente;
}

export interface DatosRegistro {
  nombres: string;
  apellidos: string;
  documento: string;
  telefono: string;
  correo: string;
  clave: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly retraso = 600;
  private readonly claveStorage = 'saludcitas_sesion';

  private usuarios: Usuario[] = [...USUARIOS];
  private pacientes: Paciente[] = [...PACIENTES];

  private readonly sesionSubject = new BehaviorSubject<Sesion | null>(this.leerSesion());
  readonly sesion$ = this.sesionSubject.asObservable();

  get sesionActual(): Sesion | null {
    return this.sesionSubject.value;
  }

  get estaAutenticado(): boolean {
    return this.sesionActual !== null;
  }

  get esAdmin(): boolean {
    return this.sesionActual?.usuario.rol === 'admin';
  }

  login(correo: string, clave: string): Observable<Sesion> {
    return of(null).pipe(
      delay(this.retraso),
      map(() => {
        const usuario = this.usuarios.find(
          (u) => u.correo.toLowerCase() === correo.toLowerCase() && u.clave === clave
        );
        if (!usuario) {
          throw new Error('Correo o contraseña incorrectos');
        }
        return this.crearSesion(usuario);
      }),
      tap((sesion) => this.guardarSesion(sesion))
    );
  }

  registrar(datos: DatosRegistro): Observable<Sesion> {
    return of(null).pipe(
      delay(this.retraso),
      map(() => {
        const existe = this.usuarios.some(
          (u) => u.correo.toLowerCase() === datos.correo.toLowerCase()
        );
        if (existe) {
          throw new Error('Ya existe una cuenta con ese correo');
        }

        const nuevoUsuario: Usuario = {
          usuarioId: Math.max(...this.usuarios.map((u) => u.usuarioId)) + 1,
          correo: datos.correo,
          clave: datos.clave,
          rol: 'paciente',
        };
        const nuevoPaciente: Paciente = {
          pacienteId: Math.max(...this.pacientes.map((p) => p.pacienteId)) + 1,
          usuarioId: nuevoUsuario.usuarioId,
          nombres: datos.nombres,
          apellidos: datos.apellidos,
          documento: datos.documento,
          telefono: datos.telefono,
        };

        // Inmutabilidad: reemplazamos los arreglos con copias nuevas
        this.usuarios = [...this.usuarios, nuevoUsuario];
        this.pacientes = [...this.pacientes, nuevoPaciente];

        return this.crearSesion(nuevoUsuario);
      }),
      tap((sesion) => this.guardarSesion(sesion))
    );
  }

  logout(): void {
    localStorage.removeItem(this.claveStorage);
    this.sesionSubject.next(null);
  }

  private crearSesion(usuario: Usuario): Sesion {
    const { clave, ...usuarioSinClave } = usuario;
    return {
      token: 'mock-jwt-' + btoa(`${usuario.usuarioId}:${Date.now()}`),
      usuario: usuarioSinClave,
      paciente: this.pacientes.find((p) => p.usuarioId === usuario.usuarioId),
    };
  }

  private guardarSesion(sesion: Sesion): void {
    localStorage.setItem(this.claveStorage, JSON.stringify(sesion));
    this.sesionSubject.next(sesion);
  }

  private leerSesion(): Sesion | null {
    try {
      const guardada = localStorage.getItem(this.claveStorage);
      return guardada ? (JSON.parse(guardada) as Sesion) : null;
    } catch {
      return null;
    }
  }
}