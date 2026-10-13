export type EstadoCita = 'programada' | 'cancelada' | 'atendida';

export interface Cita {
     citaId: number;
  pacienteId: number;
  medicoId: number;
  sedeId: number;
  fechaHora: string; // formato ISO, por ejemplo '2026-10-20T09:30:00'
  estado: EstadoCita;

}
