import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PrioritelistModel, ApiResponse, ApiError } from 'src/app/store/Priorite/priorite.model';

@Injectable({
  providedIn: 'root'
})
export class PrioriteService {
  private apiUrl = 'http://localhost:8000/api/api';
  
  // Variables pour stocker les informations de pagination
  private currentPage = 1;
  private totalItems = 0;
  private itemsPerPage = 10; // Valeur par défaut selon votre configuration REST_FRAMEWORK.PAGE_SIZE

  constructor(private http: HttpClient) { }

  /**
   * Récupère les priorités avec pagination
   */
  getAllPriorites(page: number = 1): Observable<ApiResponse<PrioritelistModel>> {
    const options = { headers: this.getAuthHeaders() };
    this.currentPage = page; // Mise à jour de la page courante
    
    return this.http.get<ApiResponse<PrioritelistModel>>(`${this.apiUrl}/priorites/?page=${page}`, options)
      .pipe(
        tap(response => {
          // Stocker les informations de pagination pour les utiliser plus tard
          this.totalItems = response.count;
          this.itemsPerPage = 10; // Fixe selon votre configuration REST_FRAMEWORK
          
          console.log(`Pagination: page ${this.currentPage}, total ${this.totalItems}, par page ${this.itemsPerPage}`);
        }),
        catchError(this.handleError)
      );
  }
  
  /**
   * Récuperer les priorités sans pagination
   */

  getListPriorites(): Observable<PrioritelistModel[]> {
    //const options = { headers: this.getAuthHeaders() };
  
    return this.http.get<PrioritelistModel[]>(`${this.apiUrl}/public/priorites/`)
      .pipe(
        tap(response => {
          console.log(`Total non paginé : ${response.length}`);
        }),
        catchError(this.handleError)
      );
  }
  

  /**
   * Récupère un priorite par son ID
   */
  getPrioriteById(id: string): Observable<PrioritelistModel> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<PrioritelistModel>(`${this.apiUrl}/priorites/${id}/`, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crée un nouveau priorite
   */
  createPriorite(priorite: Partial<PrioritelistModel>): Observable<PrioritelistModel> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.post<PrioritelistModel>(`${this.apiUrl}/priorites/`, priorite, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Met à jour un priorite existant
   */
  updatePriorite(priorite: PrioritelistModel): Observable<PrioritelistModel> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.put<PrioritelistModel>(`${this.apiUrl}/priorites/${priorite.id}/`, priorite, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Supprime un priorite
   */
  deletePriorite(id: string): Observable<void> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.delete<void>(`${this.apiUrl}/priorites/${id}/`, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Supprime plusieurs priorités
   */
  deleteMultiplePriorite(ids: number[]): Observable<any> {
    const options = { 
      headers: this.getAuthHeaders(),
      body: { ids }
    };
    return this.http.delete<any>(`${this.apiUrl}/priorites/bulk_delete/`, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtenir les informations actuelles de pagination
   * Cette méthode est utilisée après les suppressions pour déterminer 
   * si la page actuelle existe toujours
   */
  getCurrentPageInfo(): Observable<{currentPage: number, totalItems: number, itemsPerPage: number}> {
    return of({
      currentPage: this.currentPage,
      totalItems: this.totalItems,
      itemsPerPage: this.itemsPerPage
    });
  }

  /**
   * Crée les en-têtes HTTP avec le token d'authentification
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access-token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    });
  }

  /**
   * Gestion centralisée des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    let apiError: ApiError = {
      status: error.status,
      message: 'Une erreur est survenue'
    };
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      apiError.message = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      apiError = {
        status: error.status,
        message: error.message
      };
      
      // Extraction des erreurs de validation si disponibles
      if (error.error && typeof error.error === 'object') {
        if (error.error.message) {
          apiError.message = error.error.message;
        }
        if (error.error.errors) {
          apiError.errors = error.error.errors;
        }
      }
    }
    
    console.error('Erreur API:', apiError);
    return throwError(() => apiError);
  }
}