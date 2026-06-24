import { Component, inject, signal, effect, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
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
export class ChatWidget implements AfterViewChecked {
  protected geminiService = inject(GeminiService);
  protected isOpen = signal<boolean>(false);
  protected messageText = signal<string>('');
  private shouldScroll = false;

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
}
