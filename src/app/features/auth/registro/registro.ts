import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth-service';

function clavesIguales(control: AbstractControl): ValidationErrors | null {
  const clave = control.get('clave')?.value;
  const confirmar = control.get('confirmarClave')?.value;
  return clave === confirmar ? null : { clavesDistintas: true };
}

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group(
    {
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      documento: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      correo: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(6)]],
      confirmarClave: ['', [Validators.required]],
    },
    { validators: clavesIguales }
  );

  cargando = signal(false);
  error = signal('');

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set('');

    const { confirmarClave, ...datos } = this.form.getRawValue();
    this.auth.registrar(datos).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/paciente/inicio']);
      },
      error: (e: Error) => {
        this.cargando.set(false);
        this.error.set(e.message);
      },
    });
  }

  invalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  clavesNoCoinciden(): boolean {
    return this.form.hasError('clavesDistintas') && !!this.form.controls.confirmarClave.touched;
  }

  mensajeError(nombre: string): string {
    const c = this.form.get(nombre);
    if (!c || !c.errors) return '';
    if (c.hasError('required')) return 'Este campo es obligatorio';
    if (c.hasError('email')) return 'Escribe un correo válido';
    if (c.hasError('minlength')) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres`;
    if (c.hasError('pattern')) {
      return nombre === 'documento' ? 'Solo números (6 a 12 dígitos)' : 'Solo números (10 dígitos)';
    }
    return 'Valor no válido';
  }
}