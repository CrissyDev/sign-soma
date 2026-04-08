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
    afterNextRender(() => {
      this.startAutoSlide();
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.stopAutoSlide(); 
  }

  startAutoSlide() {
    if (isPlatformBrowser(this.platformId)) {
      this.stopAutoSlide(); 
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
    this.startAutoSlide();
  }

  onMouseEnter() {
    this.stopAutoSlide();
  }

  onMouseLeave() {
    this.startAutoSlide();
  }
}