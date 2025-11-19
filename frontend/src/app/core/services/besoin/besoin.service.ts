import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BesoinlistModel, ApiResponse, ApiError, StatistiqueGlobale } from 'src/app/store/Besoin/besoin.model';

@Injectable({
  providedIn: 'root'
})
export class BesoinService {
  private apiUrl = 'http://localhost:8000/api/api';
  private apiUrl1= 'http://localhost:8000/api';
  
  // Variables pour stocker les informations de pagination
  private currentPage = 1;
  private totalItems = 0;
  private itemsPerPage = 10; // Valeur par défaut selon votre configuration REST_FRAMEWORK.PAGE_SIZE

  constructor(private http: HttpClient) { }

  /**
   * Récupère les besoin avec pagination
   */
  getAllBesoins(page: number = 1): Observable<ApiResponse<BesoinlistModel>> {
    const options = { headers: this.getAuthHeaders() };
    this.currentPage = page; // Mise à jour de la page courante
    
    return this.http.get<ApiResponse<BesoinlistModel>>(`${this.apiUrl}/besoins/?page=${page}`, options)
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
   * Récupère un besoin par son ID
   */
  getBesoinById(id: string): Observable<BesoinlistModel> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<BesoinlistModel>(`${this.apiUrl}/besoins/${id}/`, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * statistiques des besoins
   */
  getStatistiquesGlobales(): Observable<StatistiqueGlobale> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<StatistiqueGlobale>(`${this.apiUrl}/besoins/statistiques-globales/`, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crée un nouveau besoin
   */
  createBesoin(besoin: Partial<BesoinlistModel>): Observable<BesoinlistModel> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.post<BesoinlistModel>(`${this.apiUrl}/besoins/`, besoin, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crée un nouveau besoin sans authentification
   */
  /*createNoAuthBesoin(besoin: FormData | Partial<BesoinlistModel>): Observable<BesoinlistModel> {
    return this.http.post<BesoinlistModel>(
      `${this.apiUrl1}/besoins/creer/`, // ou `/api/besoin/create/` selon ton URL réelle
      besoin
    ).pipe(
      catchError(this.handleError)
    );
  }*/

    createNoAuthBesoin(formData: FormData): Observable<any> {
      return this.http.post<any>(`${this.apiUrl1}/besoins/creer/`, formData).pipe(
        catchError(this.handleError)
      );
    }
    
  

  /**
   * Met à jour un besoin existant
   */
  updateBesoin(besoin: BesoinlistModel): Observable<BesoinlistModel> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.put<BesoinlistModel>(`${this.apiUrl}/besoins/${besoin.id}/`, besoin, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Supprime un besoin
   */
  deleteBesoin(id: string): Observable<void> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.delete<void>(`${this.apiUrl}/besoins/${id}/`, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Supprime plusieurs besoins
   */
  deleteMultipleBesoin(ids: number[]): Observable<any> {
    const options = { 
      headers: this.getAuthHeaders(),
      body: { ids }
    };
    return this.http.delete<any>(`${this.apiUrl}/besoins/bulk_delete/`, options)
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

