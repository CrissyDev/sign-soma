import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  OnInit,
  NgZone
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { GeminiService } from '../../services/gemini.service';

interface Message {
  text: string;
  time: string;
  type: 'patient' | 'doctor';
}

@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultation.html',
  styleUrls: ['./consultation.css']
})
export class Consultation implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;

  hands!: Hands;
  camera: Camera | null = null;

  isCameraRunning = false;
  lastProcessedTime = 0;
  lastGeminiTime = 0; // Separate timer for AI throttling

  patientName = '';
  issue = '';
  time = '';

  messages: Message[] = [];

  constructor(
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private gemini: GeminiService // Injected Gemini Service
  ) {}

  ngOnInit() {
    this.patientName = this.route.snapshot.queryParams['patient'] || 'John Smith';
    this.issue = this.route.snapshot.queryParams['issue'] || 'General Consultation';
    this.time = this.route.snapshot.queryParams['time'] || '10:00 AM';

    this.messages.push({
      text: 'Hello, I am ready to interpret your signs.',
      time: this.getTime(),
      type: 'patient'
    });
  }

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

  sendMessage(text: string) {
    if (!text.trim()) return;
    this.messages.push({
      text,
      time: this.getTime(),
      type: 'doctor'
    });
  }

  addMessage(text: string, type: 'patient' | 'doctor' = 'patient') {
    this.ngZone.run(() => {
      this.messages.push({
        text,
        time: this.getTime(),
        type
      });
    });
  }

  initMediaPipe() {
    this.hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1, // Increased complexity for better AI accuracy
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    this.hands.onResults((results: Results) => this.onResults(results));
  }

  toggleCamera() {
    this.isCameraRunning ? this.stopCamera() : this.startCamera();
  }

  startCamera() {
    if (this.isCameraRunning) return;
    const video = this.videoRef.nativeElement;

    this.ngZone.runOutsideAngular(() => {
      this.camera = new Camera(video, {
        onFrame: async () => {
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
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    this.isCameraRunning = false;
  }

  onResults(results: Results) {
    if (!this.isCameraRunning) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks?.length) {
      const landmarks = results.multiHandLandmarks[0];
      this.drawLandmarks(ctx, landmarks);

      // Throttling Gemini API calls to every 3.5 seconds
      const now = Date.now();
      if (now - this.lastGeminiTime > 3500) {
        this.lastGeminiTime = now;
        this.processAiTranslation(landmarks);
      }
    }
  }

  async processAiTranslation(landmarks: any) {
    try {
      const translation = await this.gemini.translate(landmarks);
      if (translation && translation !== "Error translating...") {
        this.addMessage(translation, 'patient');
      }
    } catch (error) {
      console.error("Consultation AI Error:", error);
    }
  }

  drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: any) {
    ctx.fillStyle = '#1a3cff';
    for (const point of landmarks) {
      ctx.beginPath();
      ctx.arc(point.x * ctx.canvas.width, point.y * ctx.canvas.height, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}