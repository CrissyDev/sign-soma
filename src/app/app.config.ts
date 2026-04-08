import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// Firebase Imports
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';

// Replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyALdjDXo68_mkTIk7muh702v5R5zPzATQ8",
  authDomain: "gen-lang-client-0755878925.firebaseapp.com",
  projectId: "gen-lang-client-0755878925",
  storageBucket: "gen-lang-client-0755878925.firebasestorage.app",
  messagingSenderId: "361609012347",
  appId: "1:361609012347:web:cf60d868a855fb4d35eede",
  measurementId: "G-FV7J4E0RWF"
};

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Fix for NG0908 (Zone.js requirement)
    provideZoneChangeDetection({ eventCoalescing: true }),

    // 2. Routing setup
    provideRouter(routes),

    // 3. SSR Support (Hydration helps prevent the page from flickering on load)
    provideClientHydration(withEventReplay()),

    // 4. Firebase App Initialization
    provideFirebaseApp(() => initializeApp(firebaseConfig)),

    // 5. Auth Provider (Fixes the NG0201: No provider found for _Auth error)
    provideAuth(() => getAuth()),

    // 6. Firestore Provider (Useful for storing patient/doctor data later)
    provideFirestore(() => getFirestore()),
  ]
};