import { Action, createReducer, on } from '@ngrx/store';
import { 
  addbesoinDataSuccess, 
  addNoAuthbesoinDataSuccess,
  deletebesoinSuccess,
  deletemultiplebesoinSuccess,
  fetchbesoinData, 
  fetchbesoinFailure, 
  fetchbesoinSuccess, 
  updatebesoinDataSuccess,
  fetchstatistiquebesoinData,
  fetchstatistiquebesoinSuccess,
  fetchstatistiquebesoinFailure 
} from './besoin.action';
import { BesoinlistModel, StatistiqueGlobale } from './besoin.model';

export interface BesoinState {
  besoindata: BesoinlistModel[];
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

export const initialState: BesoinState = {
  besoindata: [],
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

export const BesoinReducer = createReducer(
  initialState,
  on(fetchbesoinData, (state, { page }) => {
    return { ...state, loading: true, error: null, currentPage: page || state.currentPage };
  }),
  on(fetchbesoinSuccess, (state, { response }) => {
    return { 
      ...state, 
      besoindata: response.results, 
      totalItems: response.count,
      next: response.next,
      previous: response.previous,
      loading: false 
    };
  }),
  on(fetchbesoinFailure, (state, { error }) => {
    return { ...state, error, loading: false };
  }),
   
  on(addbesoinDataSuccess, (state, { newData }) => {
    return { ...state, error: null };
  }),
  on(addNoAuthbesoinDataSuccess, (state, { newData }) => {
    return { ...state, error: null };
  }),
  on(updatebesoinDataSuccess, (state, { updatedData }) => {
    return { ...state, error: null };
  }),
   
  on(deletebesoinSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),
  
  on(deletemultiplebesoinSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),

  on(fetchstatistiquebesoinData, (state) => ({
    ...state,
    loadingStat: true,
    errorStat: null
  })),
  on(fetchstatistiquebesoinSuccess, (state, { response }) => ({
    ...state,
    statistiqueGlobale: response,
    loadingStat: false
  })),
  on(fetchstatistiquebesoinFailure, (state, { error }) => ({
    ...state,
    errorStat: error,
    loadingStat: false
  })),

);

// Selector
export function reducer(state: BesoinState | undefined, action: Action) {
  return BesoinReducer(state, action);
}