import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MovieService } from './movie.service';
import { Movie } from '../models/movie.model';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  movies?: Movie[];
  loading?: boolean;
  loadingMovies?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private http = inject(HttpClient);
  private movieService = inject(MovieService);

  private historySignal = signal<ChatMessage[]>([]);
  public history = this.historySignal.asReadonly();

  sendMessage(message: string) {
    if (!message || message.trim() === '') return;

    // 1. Agregar el mensaje del usuario al historial
    const userMessage: ChatMessage = {
      role: 'user',
      text: message.trim()
    };
    this.historySignal.update(h => [...h, userMessage]);

    // 2. Agregar un mensaje de carga temporal para la respuesta de la IA
    const loadingMessage: ChatMessage = {
      role: 'model',
      text: 'Pensando...',
      loading: true
    };
    this.historySignal.update(h => [...h, loadingMessage]);

    // 3. Preparar el historial de chat para enviarlo a la API (excluyendo el mensaje temporal de carga)
    const historyToSend = this.historySignal()
      .slice(0, -1)
      .map(msg => ({
        role: msg.role,
        text: msg.text
      }));

    // 4. Consumir la API de chat del backend
    this.http.post<{ response: string; movies: string[] }>('/api/chat', {
      message: message.trim(),
      history: historyToSend
    }).subscribe({
      next: (res) => {
        const responseText = res.response;
        const movieTitles = res.movies || [];

        const assistantMessage: ChatMessage = {
          role: 'model',
          text: responseText,
          movies: [],
          loadingMovies: movieTitles.length > 0
        };

        // Reemplazar el mensaje de carga con la respuesta real de la IA
        this.historySignal.update(h => {
          const list = [...h];
          list[list.length - 1] = assistantMessage;
          return list;
        });

        // 5. Si hay películas recomendadas/mencionadas, buscarlas en TMDB en paralelo
        if (movieTitles.length > 0) {
          let fetchedCount = 0;
          const movieResults: Movie[] = [];

          movieTitles.forEach((title: string) => {
            this.movieService.searchMovies(title).subscribe({
              next: (searchRes) => {
                if (searchRes.results && searchRes.results.length > 0) {
                  // Tomamos la primera coincidencia que suele ser la más relevante
                  const bestMatch = searchRes.results[0];
                  // Evitar duplicados por si acaso
                  if (!movieResults.some(m => m.id === bestMatch.id)) {
                    movieResults.push(bestMatch);
                  }
                }
                fetchedCount++;
                this.updateAssistantMoviesIfDone(fetchedCount, movieTitles.length, movieResults);
              },
              error: (err) => {
                console.error(`Error buscando película "${title}" en TMDB:`, err);
                fetchedCount++;
                this.updateAssistantMoviesIfDone(fetchedCount, movieTitles.length, movieResults);
              }
            });
          });
        }
      },
      error: (err) => {
        console.error('Error al comunicarse con la API de Chat:', err);
        this.historySignal.update(h => {
          const list = [...h];
          list[list.length - 1] = {
            role: 'model',
            text: '¡Vaya! Parece que se ha cortado la señal de mi proyector. Ocurrió un error al intentar conectarme con mi cerebro cinéfilo. Por favor, vuelve a intentarlo.'
          };
          return list;
        });
      }
    });
  }

  private updateAssistantMoviesIfDone(fetchedCount: number, totalCount: number, movieResults: Movie[]) {
    if (fetchedCount === totalCount) {
      this.historySignal.update(h => {
        const list = [...h];
        const lastMsg = list[list.length - 1];
        if (lastMsg && lastMsg.role === 'model') {
          list[list.length - 1] = {
            ...lastMsg,
            movies: movieResults,
            loadingMovies: false
          };
        }
        return list;
      });
    }
  }

  clearHistory() {
    this.historySignal.set([]);
  }
}
