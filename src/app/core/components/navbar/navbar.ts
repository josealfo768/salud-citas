import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private auth = inject(AuthService);
  private router = inject(Router);

  sesion$ = this.auth.sesion$;
  menuAbierto = false;

  salir(): void {
    this.auth.logout();
    this.menuAbierto = false;
    this.router.navigate(['/auth/login']);
  }
}