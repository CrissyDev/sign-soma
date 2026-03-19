import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-onboarding',
  standalone: true, 
  imports: [CommonModule, RouterModule], 
  templateUrl: './onboarding.html',
  styleUrls: ['./onboarding.css']
})
export class OnboardingComponent implements OnInit {

  currentIndex = 0;

  slides = [
    {
      title: 'Welcome to Sign Soma',
      description: 'Bridging communication between deaf patients and doctors.',
      image: 'assets/pexels-gabby-k-7114329.jpg'
    },
    {
      title: 'Understand Every Sign',
      description: 'Translate sign language into clear medical communication.',
      image: 'assets/pexels-gustavo-fring-5622668.jpg'
    },
    {
      title: 'Better Healthcare Access',
      description: 'Making hospitals inclusive for everyone.',
      image: 'assets/pexels-ketut-subiyanto-4584454.jpg'
    }
  ];

  ngOnInit() {
    this.autoSlide();
  }

  autoSlide() {
    setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }
}