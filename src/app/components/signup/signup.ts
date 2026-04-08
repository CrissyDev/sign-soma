import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Firebase Imports
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Form Model
  signupData = {
    name: '',
    email: '',
    password: '',
    role: 'patient' as 'doctor' | 'patient'
  };

  isLoading = false;

  async onSignup() {
    const { name, email, password, role } = this.signupData;

    if (!name || !email || !password) {
      alert('Please fill in all fields to join Sign Soma.');
      return;
    }

    this.isLoading = true;

    try {
      // 1. Create the user account
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Store the role in Firestore
      // This is what the Login component will look for later
      await setDoc(doc(this.firestore, 'users', uid), {
        uid,
        name,
        email,
        role,
        createdAt: new Date()
      });

      // 3. Route to the correct dashboard immediately
      this.router.navigate([`/${role}-dashboard`]);

    } catch (error: any) {
      console.error("Signup failed", error);
      alert(this.getErrorMessage(error.code));
    } finally {
      this.isLoading = false;
    }
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use': return 'This email is already registered.';
      case 'auth/weak-password': return 'Password should be at least 6 characters.';
      case 'auth/invalid-email': return 'Please use a valid email address.';
      default: return 'An error occurred. Please try again.';
    }
  }
}