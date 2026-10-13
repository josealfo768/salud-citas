import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Cita } from '../../../../core/models/cita';

export interface CitaVista {
  cita: Cita;
  medico: string;
  especialidad: string;
  sede: string;
  proxima: boolean;
}

@Component({
  selector: 'app-cita-card',
  standalone: false,
  templateUrl: './cita-card.html',
  styleUrl: './cita-card.scss',
})
export class CitaCard {
  @Input({ required: true }) vista!: CitaVista;
  @Output() cancelar = new EventEmitter<CitaVista>();
}