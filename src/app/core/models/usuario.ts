export type Rol = 'paciente' | 'admin';

export interface Usuario {
    usuarioId: number;
  correo: string;
  clave: string; // en un backend real sería clave_hash; aquí es solo simulación
  rol: Rol;
}
