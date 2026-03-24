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
  camera: Camera | null = null;

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
    this.stopCamera();
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
      modelComplexity: 0,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    });

    this.hands.onResults((results) => this.onResults(results));
  }

  toggleCamera() {
    if (this.isCameraRunning) {
      this.stopCamera();
    } else {
      this.startCamera();
    }
  }

  startCamera() {
    if (this.isCameraRunning) return;

    const video = this.videoRef.nativeElement;

    this.ngZone.runOutsideAngular(() => {
      this.camera = new Camera(video, {
        onFrame: async () => {

          const now = Date.now();
          if (now - this.lastProcessedTime < 100) return;
          this.lastProcessedTime = now;

          if (this.isCameraRunning) {
            await this.hands.send({ image: video });
          }
        },
        width: 960,
        height: 720
      });

      this.camera.start();
    });

    this.isCameraRunning = true;
  }

  stopCamera() {

    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }

    const video = this.videoRef?.nativeElement;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }

    const canvas = this.canvasRef?.nativeElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    this.isCameraRunning = false;

    this.addMessage('Session ended.');
  }

  onResults(results: Results) {

    if (!this.isCameraRunning) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    if (
      canvas.width !== canvas.clientWidth ||
      canvas.height !== canvas.clientHeight
    ) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks?.length) {
      for (const landmarks of results.multiHandLandmarks) {
        this.drawLandmarks(ctx, landmarks);
      }

      this.detectGesture(results.multiHandLandmarks[0]);
    }
  }

  drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: any) {
    ctx.fillStyle = '#1a3cff';

    for (const point of landmarks) {
      const x = point.x * ctx.canvas.width;
      const y = point.y * ctx.canvas.height;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  detectGesture(landmarks: any) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    const distance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) +
      Math.pow(thumbTip.y - indexTip.y, 2)
    );

    if (distance < 0.05) {
      this.addMessage('Gesture Detected');
    }
  }
}