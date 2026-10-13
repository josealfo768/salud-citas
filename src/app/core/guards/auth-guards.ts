import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth-service';

// Solo pacientes con sesión iniciada
export const pacienteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaAutenticado && !auth.esAdmin) {
    return true;
  }
  return router.createUrlTree([auth.estaAutenticado ? '/admin/medicos' : '/auth/login']);
};

// Solo administradores con sesión iniciada
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaAutenticado && auth.esAdmin) {
    return true;
  }
  return router.createUrlTree([auth.estaAutenticado ? '/paciente/inicio' : '/auth/login']);
};

// Login y registro: solo para quien aún no inició sesión
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estaAutenticado) {
    return true;
  }
  return router.createUrlTree([auth.esAdmin ? '/admin/medicos' : '/paciente/inicio']);
};