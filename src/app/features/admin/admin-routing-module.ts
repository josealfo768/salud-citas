import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Medicos } from './medicos/medicos';
import { MedicoForm } from './medico-form/medico-form';
import { Especialidades } from './especialidades/especialidades';
import { Sedes } from './sedes/sedes';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'medicos' },
  { path: 'medicos', component: Medicos },
  { path: 'medicos/nuevo', component: MedicoForm },
  { path: 'medicos/:id/editar', component: MedicoForm },
  { path: 'especialidades', component: Especialidades },
  { path: 'sedes', component: Sedes },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}