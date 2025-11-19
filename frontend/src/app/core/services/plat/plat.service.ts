import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PlatModel, ApiResponse, ApiError, StatistiqueGlobale } from 'src/app/store/Plat/plat.model';

@Injectable({
  providedIn: 'root'
})
export class PlatService {
  private apiUrl = 'http://localhost:8000/api/api';
  private apiUrl1= 'http://localhost:8000/api';
  
  // Variables pour stocker les informations de pagination
  private currentPage = 1;
  private totalItems = 0;
  private itemsPerPage = 10; // Valeur par défaut selon votre configuration REST_FRAMEWORK.PAGE_SIZE

  constructor(private http: HttpClient) { }

  /**
   * Récupère les plat avec pagination
   */
  getAllPlats(page: number = 1): Observable<ApiResponse<PlatModel>> {
    const options = { headers: this.getAuthHeaders() };
    this.currentPage = page; // Mise à jour de la page courante
    
    return this.http.get<ApiResponse<PlatModel>>(`${this.apiUrl}/plats/?page=${page}`, options)
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
   * Récupère un plat par son ID
   */
  getPlatById(id: string): Observable<PlatModel> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<PlatModel>(`${this.apiUrl}/plats/${id}/`, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * statistiques des plats
   */
  getStatistiquesGlobales(): Observable<StatistiqueGlobale> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<StatistiqueGlobale>(`${this.apiUrl}/plats/statistiques-globales/`, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crée un nouveau plat
   */
  createPlat(plat: Partial<PlatModel>): Observable<PlatModel> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.post<PlatModel>(`${this.apiUrl}/plats/`, plat, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crée un nouveau plat sans authentification
   */
  /*createNoAuthPlat(plat: FormData | Partial<PlatModel>): Observable<PlatModel> {
    return this.http.post<PlatModel>(
      `${this.apiUrl1}/plats/creer/`, // ou `/api/plat/create/` selon ton URL réelle
      plat
    ).pipe(
      catchError(this.handleError)
    );
  }*/

    /*createNoAuthPlat(formData: FormData): Observable<any> {
      return this.http.post<any>(`${this.apiUrl1}/plats/creer/`, formData).pipe(
        catchError(this.handleError)
      );
    }*/

      createPlatWithFiles(formData: FormData): Observable<any> {
        const options = { headers: this.getFormDataHeaders() }; // ✅ utiliser les bons headers
        return this.http.post<any>(`${this.apiUrl}/plats/`, formData, options)
          .pipe(
            catchError(this.handleError)
          );
      }

      updatePlatWithFiles(id: number, formData: FormData): Observable<any> {
        const options = { headers: this.getFormDataHeaders() }; // ✅ utiliser les bons headers
        return this.http.patch<any>(`${this.apiUrl}/plats/${id}/`, formData, options)
          .pipe(
            catchError(this.handleError)
          );
      }
  

  /**
   * Met à jour un plat existant
   */
  updatePlat(plat: PlatModel): Observable<PlatModel> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.put<PlatModel>(`${this.apiUrl}/plats/${plat.id}/`, plat, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Supprime un plat
   */
  deletePlat(id: string): Observable<void> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.delete<void>(`${this.apiUrl}/plats/${id}/`, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Supprime plusieurs plats
   */
  deleteMultiplePlat(ids: number[]): Observable<any> {
    const options = { 
      headers: this.getAuthHeaders(),
      body: { ids }
    };
    return this.http.delete<any>(`${this.apiUrl}/plats/bulk_delete/`, options)
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

  private getFormDataHeaders(): HttpHeaders {
    const token = localStorage.getItem('access-token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}` // ✅ SANS Content-Type
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

