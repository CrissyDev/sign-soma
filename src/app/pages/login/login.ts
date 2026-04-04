import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  private authService = inject(Auth);
  private router = inject(Router);

  email = '';
  password = '';
  isLoading = false;

  async onLogin() {
    if (!this.email || !this.password) {
      alert('Please enter both email and password.');
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.login(this.email, this.password);
      
    } catch (error: any) {
      this.isLoading = false;
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.code === 'auth/user-not-found') errorMessage = "No user found with this email.";
      if (error.code === 'auth/wrong-password') errorMessage = "Incorrect password.";
      
      alert(errorMessage);
    }
  }

  bypassLogin(role: string) {
    if (role === 'doctor') {
      this.router.navigate(['/doctor-dashboard']);
    } else {
      this.router.navigate(['/patient-dashboard']);
    }
  }
}