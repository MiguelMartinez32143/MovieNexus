import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../../../core/services/comment.service';
import { Comment } from '../../../../core/models/comment.model';

@Component({
  selector: 'app-movie-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movie-comments.html',
  styleUrl: './movie-comments.css',
})
export class MovieComments implements OnInit {
  private commentService = inject(CommentService);

  @Input() movieId!: number; // Recibe el ID desde la pantalla de detalles

  comments = signal<Comment[]>([]);
  loading = signal(false);
  error = signal('');
  submitting = signal(false);

  // Campos del formulario
  authorName = '';
  commentText = '';
  selectedRating = 5;
  showForm = false;
  successMessage = signal('');

  get itemId(): string {
    return `movie-${this.movieId}`;
  }

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.loading.set(true);
    this.error.set('');
    this.commentService.getComments(this.itemId).subscribe({
      next: (data) => {
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
        this.comments.set(sorted);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudieron cargar los comentarios. Asegúrate de que la API está activa.');
        this.loading.set(false);
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.successMessage.set('');
  }

  setRating(value: number): void {
    this.selectedRating = value;
  }

  submitComment(): void {
    if (!this.authorName.trim() || !this.commentText.trim()) return;
    this.submitting.set(true);

    this.commentService.addComment(
      this.itemId,
      this.authorName.trim(),
      this.commentText.trim(),
      this.selectedRating
    ).subscribe({
      next: (newComment) => {
        this.comments.update((allComments) => [newComment, ...allComments]);
        this.authorName = '';
        this.commentText = '';
        this.selectedRating = 5;
        this.showForm = false;
        this.submitting.set(false);
        this.successMessage.set('¡Comentario publicado exitosamente! ✅');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => {
        this.submitting.set(false);
        this.error.set('Error al publicar. Reintenta de nuevo.');
      }
    });
  }
}

