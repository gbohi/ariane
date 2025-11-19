export interface PlatModel {
  id?: number;
  nom: string;
  description?: string;
  type_plat: number;
  agence: number;
}


export interface ApiResponse<T> {
    count: number;        // Nombre total d'éléments disponibles
    next: string | null;  // URL de la page suivante (null s'il n'y en a pas)
    previous: string | null; // URL de la page précédente (null s'il n'y en a pas)
    results: T[];         // Tableau contenant les données
  }
  
  /**
   * Interface pour représenter un objet d'erreur API
   */
  export interface ApiError {
    status: number;      // Code d'état HTTP
    message: string;     // Message d'erreur
    errors?: {           // Erreurs de validation par champ (optionnel)
      [field: string]: string[];
    };
  }

  /**
   * Statisqtique globale
   */
  export interface StatistiqueGlobale {
    par_etat: { etat: string; nombre: number }[];
    par_priorite: { priorite: string; nombre: number }[];
    total_non_cloture: number;
    total_besoin: number;
  }

  export interface PlatUploadPayload {
    plat: PlatModel;
    fichiers: File[];
  }
  