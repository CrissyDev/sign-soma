import { Routes } from '@angular/router';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Onboarding } from './pages/onboarding/onboarding';
import { Login } from './pages/login/login';
import { SignupComponent } from './components/signup/signup'; 
import { DoctorDashboard } from './pages/doctor-dashboard/doctor-dashboard';
import { PatientDashboard } from './pages/patient-dashboard/patient-dashboard';
import { Consultation } from './pages/consultation/consultation';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

export const routes: Routes = [
  { path: '', redirectTo: 'onboarding', pathMatch: 'full' },
  { path: 'onboarding', component: Onboarding },
  { path: 'login', component: Login },
  { path: 'signup', component: SignupComponent }, 
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