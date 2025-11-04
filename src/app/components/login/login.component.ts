import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginResponse } from '../../interfaces/auth.interfaces';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  private router = inject(Router);
  private authService = inject(AuthService);

  onLogin() {
    if (!this.username || !this.password) {
      this.error.set('Por favor complete todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.username, this.password).subscribe({
      next: (response: LoginResponse) => {
        console.log('Login exitoso:', response);
        
        // Guarda el token si lo necesitas
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        // Guarda los datos del usuario
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        this.loading.set(false);
        
        // ⭐ REDIRECCIONA SEGÚN EL ROL
        const role = response.user?.role;
        
        if (role === 'admin') {
          console.log('Redirigiendo a admin...');
          this.router.navigate(['/admin']);
        } else if (role === 'student') {
          console.log('Redirigiendo a estudiante...');
          this.router.navigate(['/student']);
        } else {
          console.log('Rol desconocido:', role);
          this.router.navigate(['/login']);
        }
      },
      error: (err: any) => {
        console.error('Error en login:', err);
        this.error.set('Credenciales inválidas o error en el servidor');
        this.loading.set(false);
      }
    });
  }
}