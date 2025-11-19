import { Action, createReducer, on } from '@ngrx/store';
import { 
  addplatDataSuccess, 
  addNoAuthplatDataSuccess,
  deleteplatSuccess,
  deletemultipleplatSuccess,
  fetchplatData, 
  fetchplatFailure, 
  fetchplatSuccess, 
  updateplatDataSuccess,
  fetchstatistiqueplatData,
  fetchstatistiqueplatSuccess,
  fetchstatistiqueplatFailure,
  updatePlatWithFilesSuccess,
  updatePlatWithFilesFailure
} from './plat.action';
import { PlatModel, StatistiqueGlobale } from './plat.model';

export interface PlatState {
  platdata: PlatModel[];
  totalItems: number;
  next: string | null;
  previous: string | null;
  loading: boolean;
  error: any;
  currentPage: number;

  // ➕ nouveaux champs pour les statistiques
  statistiqueGlobale: StatistiqueGlobale | null;
  loadingStat: boolean;
  errorStat: string | null;
}

export const initialState: PlatState = {
  platdata: [],
  totalItems: 0,
  next: null,
  previous: null,
  loading: false,
  error: null,
  currentPage: 1,

  // ➕ initialisation des statistiques
  statistiqueGlobale: null,
  loadingStat: false,
  errorStat: null
};

export const PlatReducer = createReducer(
  initialState,
  on(fetchplatData, (state, { page }) => {
    return { ...state, loading: true, error: null, currentPage: page || state.currentPage };
  }),
  on(fetchplatSuccess, (state, { response }) => {
    return { 
      ...state, 
      platdata: response.results, 
      totalItems: response.count,
      next: response.next,
      previous: response.previous,
      loading: false 
    };
  }),
  on(fetchplatFailure, (state, { error }) => {
    return { ...state, error, loading: false };
  }),
   
  on(addplatDataSuccess, (state, { newData }) => {
    return { ...state, error: null };
  }),
  on(addNoAuthplatDataSuccess, (state, { newData }) => {
    return { ...state, error: null };
  }),
  on(updateplatDataSuccess, (state, { updatedData }) => {
    return { ...state, error: null };
  }),
   
  on(deleteplatSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),
  
  on(deletemultipleplatSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),

  on(fetchstatistiqueplatData, (state) => ({
    ...state,
    loadingStat: true,
    errorStat: null
  })),
  on(fetchstatistiqueplatSuccess, (state, { response }) => ({
    ...state,
    statistiqueGlobale: response,
    loadingStat: false
  })),
  on(fetchstatistiqueplatFailure, (state, { error }) => ({
    ...state,
    errorStat: error,
    loadingStat: false
  })),
  on(updatePlatWithFilesSuccess, (state, { updatedPlat }) => {
    return { ...state }; // Tu peux mettre à jour platdata ici si nécessaire
  }),
  on(updatePlatWithFilesFailure, (state, { error }) => {
    return { ...state, error };
  }),
  
  

);

// Selector
export function reducer(state: PlatState | undefined, action: Action) {
  return PlatReducer(state, action);
}