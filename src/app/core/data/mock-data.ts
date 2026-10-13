import { Especialidad } from '../models/especialidad';
import { Sede } from '../models/sede';
import { Medico } from '../models/medico';
import { Usuario } from '../models/usuario';
import { Paciente } from '../models/paciente';
import { Cita } from '../models/cita';

export const ESPECIALIDADES: Especialidad[] = [
  { especialidadId: 1, nombre: 'Medicina General' },
  { especialidadId: 2, nombre: 'Pediatría' },
  { especialidadId: 3, nombre: 'Odontología' },
  { especialidadId: 4, nombre: 'Dermatología' },
  { especialidadId: 5, nombre: 'Cardiología' },
];

export const SEDES: Sede[] = [
  { sedeId: 1, nombre: 'Sede Centro', direccion: 'Carrera 50 # 52-10' },
  { sedeId: 2, nombre: 'Sede Laureles', direccion: 'Circular 4 # 70-25' },
  { sedeId: 3, nombre: 'Sede Poblado', direccion: 'Calle 10 # 35-40' },
];

export const MEDICOS: Medico[] = [
  { medicoId: 1, especialidadId: 1, nombres: 'Carlos', apellidos: 'Ramírez', sedeIds: [1, 2], activo: true },
  { medicoId: 2, especialidadId: 1, nombres: 'Laura', apellidos: 'Gómez', sedeIds: [3], activo: true },
  { medicoId: 3, especialidadId: 2, nombres: 'Andrea', apellidos: 'Restrepo', sedeIds: [1, 3], activo: true },
  { medicoId: 4, especialidadId: 2, nombres: 'Julián', apellidos: 'Cárdenas', sedeIds: [2], activo: true },
  { medicoId: 5, especialidadId: 3, nombres: 'Marcela', apellidos: 'Ospina', sedeIds: [1], activo: true },
  { medicoId: 6, especialidadId: 4, nombres: 'Santiago', apellidos: 'Vélez', sedeIds: [2, 3], activo: true },
  { medicoId: 7, especialidadId: 5, nombres: 'Patricia', apellidos: 'Montoya', sedeIds: [3], activo: true },
  { medicoId: 8, especialidadId: 5, nombres: 'Felipe', apellidos: 'Arango', sedeIds: [1], activo: false },
];

export const USUARIOS: Usuario[] = [
  { usuarioId: 1, correo: 'admin@saludcitas.com', clave: 'Admin123', rol: 'admin' },
  { usuarioId: 2, correo: 'paciente@correo.com', clave: 'Paciente123', rol: 'paciente' },
];

export const PACIENTES: Paciente[] = [
  { pacienteId: 1, usuarioId: 2, nombres: 'María', apellidos: 'López', documento: '1020304050', telefono: '3001234567' },
];

export const CITAS: Cita[] = [
  { citaId: 1, pacienteId: 1, medicoId: 1, sedeId: 1, fechaHora: '2026-09-15T09:00:00', estado: 'atendida' },
  { citaId: 2, pacienteId: 1, medicoId: 3, sedeId: 1, fechaHora: '2026-10-20T10:00:00', estado: 'programada' },
];