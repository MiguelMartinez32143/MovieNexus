import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hero } from './hero';

describe('Hero', () => {
  let component: Hero;
  let fixture: ComponentFixture<Hero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hero],
    }).compileComponents();

    fixture = TestBed.createComponent(Hero);
    component = fixture.componentInstance;
    component.movie = {
      id: 1,
      title: 'Mock Movie',
      backdrop_path: '/backdrop.jpg',
      overview: 'Mock description',
    } as any;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

