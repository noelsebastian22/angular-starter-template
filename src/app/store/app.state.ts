import { AuthState } from '../features/auth/store/auth.state';

export interface AppState {
  // Add feature state slices here (e.g., auth: AuthState)
  auth: AuthState;
}
