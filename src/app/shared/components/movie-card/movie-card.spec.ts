import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCard } from './movie-card';
import { provideRouter } from '@angular/router';

describe('MovieCard', () => {
  let component: MovieCard;
  let fixture: ComponentFixture<MovieCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCard);
    component = fixture.componentInstance;
    component.movie = {
      id: 1,
      title: 'Mock Movie',
      poster_path: '/mock.jpg',
      release_date: '2023-01-01',
      vote_average: 7.8,
      overview: 'Mock description',
    } as any;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

