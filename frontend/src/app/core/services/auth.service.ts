import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { User } from '../../store/Authentication/auth.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TokenStorageService } from './token-storage.service';

// Actions
import { 
  login, 
  loginSuccess, 
  loginFailure, 
  logout, 
  logoutSuccess 
} from '../../store/Authentication/authentication.actions';
import { getFirebaseBackend } from 'src/app/authUtils';

const API_URL = 'http://localhost:8000/api/api';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser$: Observable<User>;

  constructor(
    private http: HttpClient,
    private store: Store,
    private tokenStorage: TokenStorageService
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(
      this.tokenStorage.getUser()
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(username: string, password: string) {
    this.store.dispatch(login({ username, password }));

    return this.http.post(`${API_URL}/token/`, { username, password }).pipe(
      switchMap((tokens: any) => {
        // Stockage des tokens
        this.tokenStorage.saveToken(tokens.access, tokens.refresh);
        console.log(tokens)
        // Récupération du profil utilisateur
        return this.getUserProfile();
      }),
      catchError(error => {
        const errorMessage = error.error?.detail || 'Échec de la connexion';
        this.store.dispatch(loginFailure({ error: errorMessage }));
        return throwError(() => errorMessage);
      })
    );
  }

  getUserProfile(): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization', 
      `Bearer ${this.tokenStorage.getAccessToken()}`
    );

    return this.http.get(`${API_URL}/users/me/`, { headers }).pipe(
      map(user => {
        this.tokenStorage.saveUser(user);
        console.log(user)
        this.currentUserSubject.next(user as User);
        this.store.dispatch(loginSuccess({ user: user as User }));
        return user;
      })
    );
  }

  refreshToken() {
    return this.http.post(`${API_URL}/token/refresh/`, {
      refresh: this.tokenStorage.getRefreshToken()
    }).pipe(
      map((tokens: any) => {
        this.tokenStorage.saveAccessToken(tokens.access);
        return tokens;
      })
    );
  }

  logout(): Observable<void> {
    this.store.dispatch(logout());
    this.tokenStorage.signOut();
    this.currentUserSubject.next(null!);
    this.store.dispatch(logoutSuccess());
    return of(undefined);
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.isAuthenticated();
  }

  public currentUser(): any {
    return getFirebaseBackend()!.getAuthenticatedUser();
}
}