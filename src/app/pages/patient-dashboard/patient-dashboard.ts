import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Hands } from '@mediapipe/hands';
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
  camera!: Camera;

  isCameraRunning = false;
  lastProcessedTime = 0;

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
      // Run inside Angular only when updating UI
      this.ngZone.run(() => {
        this.messages.push({
          text,
          time: this.getTime()
        });
      });
    }
  }

  initMediaPipe() {
    this.hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0, // 🔥 reduce load (IMPORTANT)
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    });

    this.hands.onResults((results) => {
      this.onResults(results);
    });
  }

  startCamera() {
    if (this.isCameraRunning) return; // prevent duplicate start

    const video = this.videoRef.nativeElement;

    this.ngZone.runOutsideAngular(() => {
      this.camera = new Camera(video, {
        onFrame: async () => {

          // 🔥 Throttle frames (process every ~100ms)
          const now = Date.now();
          if (now - this.lastProcessedTime < 100) return;

          this.lastProcessedTime = now;

          await this.hands.send({ image: video });
        },
        width: 640,
        height: 480
      });

      this.camera.start();
      this.isCameraRunning = true;
    });
  }

  onResults(results: any) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    if (!results.image) return;

    canvas.width = results.image.width;
    canvas.height = results.image.height;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        this.drawLandmarks(ctx, landmarks);
      }

      this.detectGesture(results.multiHandLandmarks[0]);
    }

    ctx.restore();
  }

  drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: any) {
    ctx.fillStyle = 'lime';

    for (let i = 0; i < landmarks.length; i++) {
      const point = landmarks[i];

      ctx.beginPath();
      ctx.arc(
        point.x * ctx.canvas.width,
        point.y * ctx.canvas.height,
        5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  detectGesture(landmarks: any) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    const distance = Math.abs(thumbTip.x - indexTip.x);

    if (distance < 0.05) {
      this.addMessage('Hello ');
    }
  }
}