import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Inicio } from './inicio/inicio';
import { Agendar } from './agendar/agendar';
import { MisCitas } from './mis-citas/mis-citas';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: 'inicio', component: Inicio },
  { path: 'agendar', component: Agendar },
  { path: 'mis-citas', component: MisCitas },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PacienteRoutingModule {}