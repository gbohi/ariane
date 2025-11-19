import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, exhaustMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthenticationService } from '../../core/services/auth.service';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { 
  login, 
  loginSuccess, 
  loginFailure, 
  logout, 
  logoutSuccess 
} from './authentication.actions';
import { Router } from '@angular/router';

@Injectable()
export class AuthenticationEffects {

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(({ username, password }) =>
        this.authService.login(username, password).pipe(
          switchMap((response: any) => {
            // On attend la réponse du getUserProfile après le login
            return this.authService.getUserProfile().pipe(
              map((user: any) => {
                console.log(1234)
                console.log(localStorage.getItem('access-token'));
                this.router.navigate(['/']);
                return loginSuccess({ user });
              })
            );
          }),
          catchError((error) => {
            return of(loginFailure({ error: error.error?.detail || 'Échec de la connexion' }));
          })
        )
      )
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      tap(() => {
        this.tokenStorage.signOut();
        this.router.navigate(['/login']);
      }),
      map(() => logoutSuccess())
    )
  );

  // Redirection après login réussi
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap((action) => {
          // On peut accéder aux données de l'utilisateur ici si nécessaire
          // console.log('User logged in:', action.user);
          this.router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );

  // Redirection après erreur de login
  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginFailure),
        tap((action) => {
          // Gérer l'affichage de l'erreur si nécessaire
          console.error('Login error:', action.error);
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private authService: AuthenticationService,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {}
}