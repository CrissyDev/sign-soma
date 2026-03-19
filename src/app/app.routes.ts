import { Routes } from '@angular/router';
import { OnboardingComponent } from './pages/onboarding/onboarding';
// import { HomeComponent } from './pages/home/home.component';
// import { CameraComponent } from './pages/camera/camera.component';
// import { SymptomsComponent } from './pages/symptoms/symptoms.component';
// import { AccountComponent } from './pages/account/account.component';

export const routes: Routes = [
  { path: '', redirectTo: 'onboarding', pathMatch: 'full' },

  { path: 'onboarding', component: OnboardingComponent },

//   { path: 'home', component: HomeComponent },
//   { path: 'camera', component: CameraComponent },
//   { path: 'symptoms', component: SymptomsComponent },
//   { path: 'account', component: AccountComponent },

  { path: '**', redirectTo: 'onboarding' }
];