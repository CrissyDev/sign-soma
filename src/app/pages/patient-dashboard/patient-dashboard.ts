import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-dashboard.html',
  styleUrls: ['./patient-dashboard.css']
})
export class PatientDashboard implements AfterViewInit {

  @ViewChild('videoElement') videoRef!: ElementRef;
  @ViewChild('canvasElement') canvasRef!: ElementRef;

  hands!: Hands;
  camera!: Camera;

  ngAfterViewInit() {
    this.initMediaPipe();
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
    const videoElement = this.videoRef.nativeElement;

    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: videoElement });
      },
      width: 640,
      height: 480
    });

    this.camera.start();
  }

  onResults(results: any) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    canvas.width = results.image.width;
    canvas.height = results.image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        this.drawLandmarks(ctx, landmarks);
      }

      this.detectGesture(results.multiHandLandmarks[0]);
    }
  }

  drawLandmarks(ctx: any, landmarks: any) {
    ctx.fillStyle = 'lime';

    for (const point of landmarks) {
      ctx.beginPath();
      ctx.arc(
        point.x * ctx.canvas.width,
        point.y * ctx.canvas.height,
        5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }

  detectGesture(landmarks: any) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    const distance = Math.abs(thumbTip.x - indexTip.x);

    if (distance < 0.05) {
      console.log('Detected: Hello 👋');

    }
  }
}