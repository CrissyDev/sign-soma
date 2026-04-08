import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// 1. Correct Firebase Auth & Firestore imports
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  // 2. Inject standard Firebase services
  private auth = inject(Auth); 
  private firestore = inject(Firestore);
  private router = inject(Router);

  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  async onLogin() {
    if (!this.email || !this.password) {
      alert('Please enter both email and password.');
      return;
    }

    this.isLoading = true;

    try {
      // 3. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      const uid = userCredential.user.uid;

      // 4. Fetch the User Role from Firestore
      await this.handleUserRedirection(uid);

    } catch (error: any) {
      let errorMessage = "Login failed. Please check your credentials.";
      
      // Handle Firebase specific error codes
      if (error.code === 'auth/invalid-credential') {
        errorMessage = "Incorrect email or password.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Try again later.";
      }
      
      alert(errorMessage);
      console.error("Login error:", error);
    } finally {
      this.isLoading = false;
    }
  }

  private async handleUserRedirection(uid: string) {
    try {
      // Assumes your users are stored in a 'users' collection with a 'role' field
      const userDocRef = doc(this.firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData['role']; // 'doctor' or 'patient'

        if (role === 'doctor') {
          this.router.navigate(['/doctor-dashboard']);
        } else {
          this.router.navigate(['/patient-dashboard']);
        }
      } else {
        // Fallback if no role is defined
        this.router.navigate(['/patient-dashboard']);
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
      // Default fallback
      this.router.navigate(['/patient-dashboard']);
    }
  }

  // Helpful for testing UI without database lookups
  bypassLogin(role: string) {
    if (role === 'doctor') {
      this.router.navigate(['/doctor-dashboard']);
    } else {
      this.router.navigate(['/patient-dashboard']);
    }
  }
}