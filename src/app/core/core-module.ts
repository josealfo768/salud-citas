import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Navbar } from './components/navbar/navbar';

@NgModule({
  declarations: [Navbar],
  imports: [CommonModule, RouterModule],
  exports: [Navbar],
})
export class CoreModule {}