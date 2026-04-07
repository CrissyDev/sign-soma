import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-onboarding',
  standalone: true, 
  imports: [CommonModule, RouterModule], 
  templateUrl: './onboarding.html',
  styleUrls: ['./onboarding.css']
})
export class Onboarding implements OnInit, OnDestroy {

  currentIndex = 0;
  private intervalId: any;

  slides = [
    {
      title: 'Welcome to Sign Soma',
      description: 'Bridging communication between deaf patients and doctors.',
      image: 'assets/pexels-cottonbro-4631068.jpg'
    },
    {
      title: 'Understand Every Sign',
      description: 'Translate sign language into clear medical communication.',
      image: 'assets/pexels-shvets-production-6975064.jpg'
    },
    {
      title: 'Better Healthcare Access',
      description: 'Making hospitals inclusive for everyone.',
      image: 'assets/pexels-shvets-production-6975072.jpg'
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // This is the modern Angular way to handle browser-only logic.
    // It ensures the slider only starts once the user actually sees the page.
    afterNextRender(() => {
      this.startAutoSlide();
    });
  }

  ngOnInit() {
    // We removed startAutoSlide from here to prevent SSR timeouts.
  }

  ngOnDestroy() {
    this.stopAutoSlide(); 
  }

  startAutoSlide() {
    // Double check we are in the browser before setting an interval
    if (isPlatformBrowser(this.platformId)) {
      this.stopAutoSlide(); // Clear any existing interval first
      this.intervalId = setInterval(() => {
        this.nextSlide();
      }, 4000);
    }
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    // Optional: Restart timer when user manually clicks a dot
    this.startAutoSlide();
  }

  onMouseEnter() {
    this.stopAutoSlide();
  }

  onMouseLeave() {
    this.startAutoSlide();
  }
}