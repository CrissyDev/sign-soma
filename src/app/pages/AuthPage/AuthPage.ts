import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// 1. Alias 'Auth' to 'FirebaseAuth' to avoid naming conflicts with your class
import { Auth as FirebaseAuth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './AuthPage.html',
  styleUrls: ['./AuthPage.css']
})
export class AuthPage {
  // 2. Inject using the alias 'FirebaseAuth'
  private auth = inject(FirebaseAuth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  role: 'doctor' | 'patient' = 'patient';
  name: string = '';
  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  selectRole(role: 'doctor' | 'patient') {
    this.role = role;
  }

  async signUp() {
    // Basic validation
    if (!this.email || !this.password || !this.name) {
      alert('Please fill in all fields to create your account.');
      return;
    }

    this.isLoading = true;

    try {
      // 3. Create the user in Firebase Auth using the injected service
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      const uid = userCredential.user.uid;

      // 4. Save the user profile and role in Firestore
      // This allows the Login page to know where to redirect the user later
      await setDoc(doc(this.firestore, 'users', uid), {
        uid: uid,
        name: this.name,
        email: this.email,
        role: this.role,
        createdAt: new Date()
      });

      // 5. Navigate to the correct dashboard based on selection
      if (this.role === 'doctor') {
        this.router.navigate(['/doctor-dashboard']);
      } else {
        this.router.navigate(['/patient-dashboard']);
      }

    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Provide user-friendly error messages
      let message = "An error occurred during sign up.";
      if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Please log in instead.";
      } else if (error.code === 'auth/weak-password') {
        message = "Password is too weak. Please use at least 6 characters.";
      }
      
      alert(message);
    } finally {
      this.isLoading = false;
    }
  }
}