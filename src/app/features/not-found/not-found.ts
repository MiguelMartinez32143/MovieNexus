import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound {}
