import { Component, inject, signal, effect, ElementRef, ViewChild, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../../core/services/gemini.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.css'
})
export class ChatWidget implements AfterViewChecked, OnDestroy {
  protected geminiService = inject(GeminiService);
  protected isOpen = signal<boolean>(false);
  protected messageText = signal<string>('');
  protected isRecording = signal<boolean>(false);
  private recognition: any = null;
  private recordingTimeout: any = null;
  private shouldScroll = false;

  protected suggestions = [
    'Recomiéndame películas de suspenso psicológico',
    '¿Qué clásicos de ciencia ficción son indispensables?',
    'Recomiéndame películas similares a Interstellar',
    '¿Qué películas destacan de Christopher Nolan?'
  ];

  @ViewChild('chatBody') private chatBodyEl!: ElementRef;

  constructor() {
    // Escuchar cambios en el historial para forzar el scroll automático al recibir respuestas.
    effect(() => {
      this.geminiService.history();
      this.shouldScroll = true;
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleChat() {
    this.isOpen.update(val => !val);
    if (this.isOpen()) {
      this.shouldScroll = true;
    }
  }

  sendMessage() {
    const text = this.messageText().trim();
    if (!text) return;

    this.geminiService.sendMessage(text);
    this.messageText.set('');
  }

  selectSuggestion(suggestion: string) {
    this.geminiService.sendMessage(suggestion);
  }

  parseMarkdown(text: string): string {
    if (!text) return '';
    let html = text;
    // Escapar HTML básico para prevenir inyección de etiquetas
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // Negrita (**texto**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Cursiva (*texto*)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Bloques de código (```codigo```)
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // Código en línea (`codigo`)
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    // Saltos de línea (\n)
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  getMoviePoster(posterPath: string | null): string {
    return posterPath
      ? `https://image.tmdb.org/t/p/w300${posterPath}`
      : 'https://placehold.co/300x450/1c1c1e/ffffff?text=No+Poster'; // fallback de imagen
  }

  scrollToBottom(): void {
    try {
      if (this.chatBodyEl) {
        this.chatBodyEl.nativeElement.scrollTop = this.chatBodyEl.nativeElement.scrollHeight;
      }
    } catch (err) {
      // Ignorar errores de inicialización del DOM
    }
  }

  initSpeechRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'es-ES';

        this.recognition.onstart = () => {
          this.isRecording.set(true);
        };

        this.recognition.onend = () => {
          this.isRecording.set(false);
        };

        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event);
          this.isRecording.set(false);
        };

        this.recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            this.messageText.set(transcript);
            
            if (this.recordingTimeout) {
              clearTimeout(this.recordingTimeout);
            }
            this.recordingTimeout = setTimeout(() => {
              this.sendMessage();
              this.stopRecording();
            }, 600);
          }
        };
      }
    }
  }

  toggleRecording() {
    if (typeof window === 'undefined') return;

    if (!this.recognition) {
      this.initSpeechRecognition();
    }

    if (!this.recognition) {
      console.warn('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.isRecording()) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (err) {
        console.error('Error starting recognition', err);
      }
    }
  }

  stopRecording() {
    if (this.recognition) {
      try {
        this.recognition.stop();
        if (this.recordingTimeout) {
          clearTimeout(this.recordingTimeout);
          this.recordingTimeout = null;
        }
      } catch (err) {
        console.error('Error stopping recognition', err);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
    }
  }
}
