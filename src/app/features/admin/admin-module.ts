import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared-module';
import { AdminRoutingModule } from './admin-routing-module';
import { Medicos } from './medicos/medicos';
import { MedicoForm } from './medico-form/medico-form';
import { Especialidades } from './especialidades/especialidades';
import { Sedes } from './sedes/sedes';

@NgModule({
  declarations: [Medicos, MedicoForm, Especialidades, Sedes],
  imports: [SharedModule, AdminRoutingModule],
})
export class AdminModule {}