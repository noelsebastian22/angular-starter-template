import { MetaReducer } from '@ngrx/store';
import { localStorageSyncReducer } from '../core/state/local-storage-sync';

export const metaReducers: MetaReducer[] = [localStorageSyncReducer];
