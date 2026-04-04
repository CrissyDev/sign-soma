import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  user 
} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  user$ = user(this.auth);

  async signUp(email: string, pass: string) {
    await createUserWithEmailAndPassword(this.auth, email, pass);
    this.router.navigate(['/patient-dashboard']);
  }

  async login(email: string, pass: string) {
    await signInWithEmailAndPassword(this.auth, email, pass);
    this.router.navigate(['/patient-dashboard']);
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}