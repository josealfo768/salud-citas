import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Spinner } from './components/spinner/spinner';
import { Alert } from './components/alert/alert';
import { ConfirmModal } from './components/confirm-modal/confirm-modal';
import { NotFound } from './components/not-found/not-found';
import { EstadoCitaPipe } from './pipes/estado-cita-pipe';

@NgModule({
  declarations: [Spinner, Alert, ConfirmModal, NotFound, EstadoCitaPipe],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    Spinner,
    Alert,
    ConfirmModal,
    EstadoCitaPipe,
  ],
})
export class SharedModule {}