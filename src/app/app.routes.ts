import { Routes } from '@angular/router';
import { Onboarding } from './pages/onboarding/onboarding';
import { Auth } from './pages/auth/auth';
import { Login} from './pages/login/login';
import { DoctorDashboard } from './pages/doctor-dashboard/doctor-dashboard';
import { PatientDashboard } from './pages/patient-dashboard/patient-dashboard';

export const routes: Routes = [

  { path: '', redirectTo: 'onboarding', pathMatch: 'full' },
  { path: 'onboarding', component: Onboarding },
  { path: 'auth', component: Auth },
  { path: 'login', component: Login },
  { path: 'doctor-dashboard', component: DoctorDashboard},
  { path: 'patient-dashboard', component: PatientDashboard },
  { path: '**', redirectTo: 'onboarding' }

];