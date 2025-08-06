import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from './store';
import * as AuthSelectors from './store';
import { AuthState } from './store';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, AsyncPipe],
  template: `
    <div>
      <h2>Login</h2>
      <form (submit)="login()">
        <input
          type="text"
          placeholder="Username"
          [(ngModel)]="username"
          name="username"
          required
        />
        <input
          type="password"
          placeholder="Password"
          [(ngModel)]="password"
          name="password"
          required
        />
        <button type="submit" [disabled]="loading$ | async">Login</button>
      </form>
      @if (loading$ | async) {
      <div>Loading...</div>
      } @if(user$ | async; as user){
      <div>Welcome, {{ user.name }}!</div>
      } @if (error$ | async; as error) {
      <div style="color: red;">{{ error }}</div>
      }
    </div>
  `,
})
export class AuthComponent {
  username = '';
  password = '';

  loading$: Observable<boolean>;
  user$: Observable<{ id: string; name: string } | null>;
  error$: Observable<string | null>;

  constructor(private store: Store<AuthState>) {
    this.loading$ = this.store.select(AuthSelectors.selectLoading);
    this.user$ = this.store.select(AuthSelectors.selectUser);
    this.error$ = this.store.select(AuthSelectors.selectError);
  }

  login() {
    if (!this.username || !this.password) {
      return;
    }
    this.store.dispatch(
      AuthActions.login({ username: this.username, password: this.password })
    );
  }
}
