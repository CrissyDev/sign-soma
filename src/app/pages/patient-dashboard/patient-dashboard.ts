import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

interface Message {
  text: string;
  time: string;
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-dashboard.html',
  styleUrls: ['./patient-dashboard.css']
})
export class PatientDashboard implements AfterViewInit, OnDestroy {

  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;

  hands!: Hands;
  camera: any; // Using any because of specific MediaPipe typing quirks

  isCameraRunning = false;

  messages: Message[] = [
    {
      text: 'Hello! I am ready to help you. Please start signing.',
      time: this.getTime()
    }
  ];

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.initMediaPipe();
  }

  ngOnDestroy() {
    if (this.camera) {
      this.camera.stop();
    }
  }

  getTime(): string {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  addMessage(text: string) {
    const last = this.messages[this.messages.length - 1];
    if (last?.text !== text) {
      this.ngZone.run(() => {
        this.messages.push({ text, time: this.getTime() });
      });
    }
  }

  initMediaPipe() {
    this.hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0, 
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.hands.onResults((results) => {
      this.onResults(results);
    });
  }

  startCamera() {
    if (this.isCameraRunning) return;

    const video = this.videoRef.nativeElement;

    // Start logic
    this.camera = new Camera(video, {
      onFrame: async () => {
        // Just send the image; MediaPipe handles the internal loop
        await this.hands.send({ image: video });
      },
      width: 640,
      height: 480
    });

    this.camera.start().then(() => {
      this.ngZone.run(() => {
        this.isCameraRunning = true;
      });
    });
  }

  onResults(results: Results) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    // Set canvas size to match video display size
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // We DON'T draw the image here anymore because the <video> tag is already showing it.
    // This saves a massive amount of CPU/GPU power.

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        this.drawLandmarks(ctx, landmarks);
      }
      this.detectGesture(results.multiHandLandmarks[0]);
    }
    ctx.restore();
  }

  drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: any) {
    ctx.fillStyle = '#1a3cff'; // Matching your brand blue
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    for (const point of landmarks) {
      const x = point.x * ctx.canvas.width;
      const y = point.y * ctx.canvas.height;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  detectGesture(landmarks: any) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const distance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + 
      Math.pow(thumbTip.y - indexTip.y, 2)
    );

    // Adjusted threshold for better pinch detection
    if (distance < 0.05) {
      this.addMessage('Gesture Detected');
    }
  }
}