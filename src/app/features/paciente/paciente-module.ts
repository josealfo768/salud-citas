import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared-module';
import { PacienteRoutingModule } from './paciente-routing-module';
import { Inicio } from './inicio/inicio';
import { Agendar } from './agendar/agendar';
import { MisCitas } from './mis-citas/mis-citas';
import { CitaCard } from './components/cita-card/cita-card';

@NgModule({
  declarations: [Inicio, Agendar, MisCitas, CitaCard],
  imports: [SharedModule, PacienteRoutingModule],
})
export class PacienteModule {}