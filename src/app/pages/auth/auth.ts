import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class Auth {

  role: string = 'patient';
  email = '';
  password = '';

  constructor(private router: Router) {}

  selectRole(role: string) {
    this.role = role;
  }

  signUp() {
    if (this.role === 'doctor') {
      this.router.navigate(['/doctor-dashboard']);
    } else {
      this.router.navigate(['/patient-dashboard']);
    }
  }
}