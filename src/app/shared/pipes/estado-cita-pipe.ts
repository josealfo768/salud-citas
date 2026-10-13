import { Pipe, PipeTransform } from '@angular/core';
import { EstadoCita } from '../../core/models/cita';

const ESTADOS: Record<EstadoCita, { texto: string; color: string }> = {
  programada: { texto: 'Programada', color: 'primary' },
  cancelada: { texto: 'Cancelada', color: 'danger' },
  atendida: { texto: 'Atendida', color: 'success' },
};

@Pipe({ name: 'estadoCita', standalone: false })
export class EstadoCitaPipe implements PipeTransform {
  transform(estado: EstadoCita, salida: 'texto' | 'color' = 'texto'): string {
    return ESTADOS[estado][salida];
  }
}