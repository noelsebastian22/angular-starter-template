import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from './store';
import * as AuthSelectors from './store';
import { AuthState } from './store';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';

import { TmdbService } from 'app/core/services/tmdb.service';

import { MovieResult } from '@infrastructure/models/tmdb.model';
import { TextInputComponent } from 'app/shared/ui/form-controls/text-input/text-input.component';

@Component({
  selector: 'app-auth',
  imports: [
    FormsModule,
    AsyncPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatListModule,
    TextInputComponent,
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  username = '';
  password = '';
  hide = true;

  loading$: Observable<boolean>;
  user$: Observable<{ id: string; name: string } | null>;
  error$: Observable<string | null>;

  private readonly tmdb = inject(TmdbService);
  movies?: MovieResult[];

  private readonly store = inject(Store<AuthState>);

  constructor() {
    this.loading$ = this.store.select(AuthSelectors.selectLoading);
    this.user$ = this.store.select(AuthSelectors.selectUser);
    this.error$ = this.store.select(AuthSelectors.selectError);
  }

  login() {
    if (!this.username || !this.password) {
      return;
    }
    this.store.dispatch(
      AuthActions.login({ username: this.username, password: this.password }),
    );
  }

  searchExample() {
    this.tmdb.searchMovies('inception', 1).subscribe({
      next: (res) => (this.movies = res.results),
      error: (err) => console.error('TMDB error', err),
    });
  }
}
