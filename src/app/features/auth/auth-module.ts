import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared-module';
import { AuthRoutingModule } from './auth-routing-module';
import { Login } from './login/login';
import { Registro } from './registro/registro';

@NgModule({
  declarations: [Login, Registro],
  imports: [SharedModule, AuthRoutingModule],
})
export class AuthModule {}