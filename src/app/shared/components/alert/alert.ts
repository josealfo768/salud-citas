import { Component, EventEmitter, Input, Output } from '@angular/core';

export type TipoAlerta = 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: false,
  templateUrl: './alert.html',
  styleUrl: './alert.scss',
})
export class Alert {
  @Input() tipo: TipoAlerta = 'info';
  @Input() mensaje = '';
  @Input() cerrable = true;
  @Output() cerrar = new EventEmitter<void>();
}