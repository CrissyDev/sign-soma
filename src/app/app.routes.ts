import { Routes } from '@angular/router';
import { OnboardingComponent } from './pages/onboarding/onboarding';
import { Auth } from './pages/auth/auth';
import { Login } from './pages/login/login';
import { DoctorDashboard } from './pages/doctor-dashboard/doctor-dashboard';
import { PatientDashboard } from './pages/patient-dashboard/patient-dashboard';

export const routes: Routes = [
  { path: '', component: OnboardingComponent },
  { path: 'auth', component: Auth },
  { path: 'login', component: Login },
  { path: 'doctor-dashboard', component: DoctorDashboard },
  { path: 'patient-dashboard', component: PatientDashboard },
];