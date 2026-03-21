import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit
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
export class PatientDashboard implements AfterViewInit {

  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;

  hands!: Hands;
  camera!: Camera;

  messages: Message[] = [
    {
      text: 'Hello! I am ready to help you. Please start signing.',
      time: this.getTime()
    }
  ];

  session = {
    status: 'Active',
    duration: '5 min'
  };

  ngAfterViewInit() {
    this.initMediaPipe();
  }

  getTime(): string {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  addMessage(text: string) {
    // prevent spam (same message repeated fast)
    const last = this.messages[this.messages.length - 1];
    if (last?.text !== text) {
      this.messages.push({
        text,
        time: this.getTime()
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
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    this.hands.onResults((results) => this.onResults(results));
  }

  startCamera() {
    const video = this.videoRef.nativeElement;

    this.camera = new Camera(video, {
      onFrame: async () => {
        await this.hands.send({ image: video });
      },
      width: 640,
      height: 480
    });

    this.camera.start();
  }

  onResults(results: any) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    canvas.width = results.image.width;
    canvas.height = results.image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0);

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        this.drawLandmarks(ctx, landmarks);
      }

      this.detectGesture(results.multiHandLandmarks[0]);
    }
  }

  drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: any) {
    ctx.fillStyle = 'lime';

    landmarks.forEach((point: any) => {
      ctx.beginPath();
      ctx.arc(
        point.x * ctx.canvas.width,
        point.y * ctx.canvas.height,
        5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  }

  detectGesture(landmarks: any) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    const distance = Math.abs(thumbTip.x - indexTip.x);

    if (distance < 0.05) {
      this.addMessage('Hello 👋');
    }
  }
}