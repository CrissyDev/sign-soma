import { 
    Component, 
    ViewChild, 
    ElementRef, 
    AfterViewInit, 
    NgZone, 
    OnDestroy,
    signal 
  } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { Hands, Results } from '@mediapipe/hands';
  import { Camera } from '@mediapipe/camera_utils';
  import { GeminiService } from '../../services/gemini.service';
  
  interface Message {
    text: string;
    time: string;
    isAi: boolean;
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
    
    messages = signal<Message[]>([
      { text: 'Hello! I am ready to help you. Please start signing.', time: this.getTime(), isAi: true }
    ]);
  
    constructor(private ngZone: NgZone, private gemini: GeminiService) {}
  
    ngAfterViewInit() {
      this.initMediaPipe();
    }
  
    ngOnDestroy() {
      this.stopCamera();
    }
  
    getTime(): string {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  
    addMessage(text: string, isAi: boolean = false) {
      this.ngZone.run(() => {
        this.messages.update(msgs => [...msgs, { text, time: this.getTime(), isAi }]);
      });
    }
  
    initMediaPipe() {
      this.hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
  
      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1, 
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
        (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        video.srcObject = null;
      }
      this.isCameraRunning = false;
      this.addMessage('Session ended.', true);
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
      
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        this.drawLandmarks(ctx, landmarks);

        const now = Date.now();
        if (now - this.lastProcessedTime > 3000) {
          this.lastProcessedTime = now;
          this.processGeminiTranslation(landmarks);
        }
      }
    }
  
    async processGeminiTranslation(landmarks: any) {
      try {
        const translation = await this.gemini.translate(landmarks);
        this.addMessage(translation, false); 
      } catch (error) {
        console.error('Gemini Translation Error:', error);
      }
    }
  
    drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: any) {
      ctx.fillStyle = '#1a3cff';
      for (const point of landmarks) {
        ctx.beginPath();
        ctx.arc(point.x * ctx.canvas.width, point.y * ctx.canvas.height, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }