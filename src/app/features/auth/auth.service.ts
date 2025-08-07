import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  login(username: string, password: string) {
    // Mock login API call: success if username === 'user' and password === 'pass'
    return of({ id: '1', name: username }).pipe(
      delay(1000),
      map((user) => {
        if (username === 'user' && password === 'pass') {
          return user;
        }
        throw new Error('Invalid credentials');
      }),
    );
  }
}
