import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { DashboardEntretienVehiculeResponse } from 'src/app/store/Dashboardentretienvehicule/dashboardentretienvehicule.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardEntretienVehiculeService {
  private apiUrl = 'http://localhost:8000/api/api';

  constructor(private http: HttpClient) {}

  getDashboardEntretien(annee: number, agence_id?: number, immatriculation?: string): Observable<DashboardEntretienVehiculeResponse> {
    let params = new HttpParams().set('annee', annee.toString());

    if (agence_id !== undefined) {
      params = params.set('agence_id', agence_id.toString());
    }

    if (immatriculation) {
      params = params.set('immatriculation', immatriculation);
    }

    return this.http.get<DashboardEntretienVehiculeResponse>((`${this.apiUrl}/etat-entretien-groupes/`), { params });
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


}