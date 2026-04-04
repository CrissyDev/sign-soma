import { Routes } from '@angular/router';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Onboarding } from './pages/onboarding/onboarding';
import { Auth } from './pages/auth/auth';
import { Login } from './pages/login/login';
import { DoctorDashboard } from './pages/doctor-dashboard/doctor-dashboard';
import { PatientDashboard } from './pages/patient-dashboard/patient-dashboard';
import { Consultation } from './pages/consultation/consultation';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

export const routes: Routes = [
  { path: '', redirectTo: 'onboarding', pathMatch: 'full' },
  { path: 'onboarding', component: Onboarding },
  { path: 'auth', component: Auth },
  { path: 'login', component: Login },

  { 
    path: 'doctor-dashboard', 
    component: DoctorDashboard,
    ...canActivate(redirectUnauthorizedToLogin) 
  },
  { 
    path: 'patient-dashboard', 
    component: PatientDashboard,
    ...canActivate(redirectUnauthorizedToLogin) 
  },
  { 
    path: 'consultation', 
    component: Consultation,
    ...canActivate(redirectUnauthorizedToLogin) 
  },

  { path: '**', redirectTo: 'onboarding' }
];