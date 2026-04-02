 import { Injectable } from '@angular/core';
 import { GoogleGenerativeAI } from '@google/generative-ai';
 import { environment } from '../../environments/environments';

 @Injectable({ providedIn: 'root' })
 export class GeminiService {
   private genAI = new GoogleGenerativeAI(environment.GEMINI_API_KEY);
   private model = this.genAI.getGenerativeModel({ 
     model: "gemini-3.1-flash-lite-preview",
     systemInstruction: "You are a medical sign language interpreter. Translate 3D hand coordinates into concise medical symptoms or patient needs."
   });

   async translate(landmarks: any[]): Promise<string> {
     try {
      const prompt = `Interpret these hand landmarks: ${JSON.stringify(landmarks)}`;
      const result = await this.model.generateContent(prompt);
       return result.response.text();
     } catch (error) {
      console.error("Gemini Error", error);
       return "Error translating...";
     }
   }
 }