import { Action, createReducer, on } from '@ngrx/store';
import { 
  addprioriteDataSuccess, 
  deleteprioriteSuccess,
  deletemultipleprioriteSuccess,
  fetchprioriteData, 
  fetchprioriteFailure, 
  fetchprioriteSuccess, 
  updateprioriteDataSuccess,
  fetchprioriteNoPaginateSuccess
} from './priorite.action';
import { PrioritelistModel } from './priorite.model';

export interface PrioriteState {
  prioritedata: PrioritelistModel[];
  allPriorites: PrioritelistModel[];         // version complète (sans pagination)
  totalItems: number;
  next: string | null;
  previous: string | null;
  loading: boolean;
  error: any;
  currentPage: number;
}

export const initialState: PrioriteState = {
  prioritedata: [],
  allPriorites: [],        // initialisé vide
  totalItems: 0,
  next: null,
  previous: null,
  loading: false,
  error: null,
  currentPage: 1
};

export const PrioriteReducer = createReducer(
  initialState,
  on(fetchprioriteData, (state, { page }) => {
    return { ...state, loading: true, error: null, currentPage: page || state.currentPage };
  }),
  on(fetchprioriteSuccess, (state, { response }) => {
    return { 
      ...state, 
      prioritedata: response.results, 
      totalItems: response.count,
      next: response.next,
      previous: response.previous,
      loading: false 
    };
  }),
  on(fetchprioriteFailure, (state, { error }) => {
    return { ...state, error, loading: false };
  }),
   
  on(addprioriteDataSuccess, (state, { newData }) => {
    return { ...state, error: null };
  }),
  on(updateprioriteDataSuccess, (state, { updatedData }) => {
    return { ...state, error: null };
  }),
   
  on(deleteprioriteSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),
  
  on(deletemultipleprioriteSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),

  on(fetchprioriteNoPaginateSuccess, (state, { response }) => {
    return {
      ...state,
      allPriorites: response, // Mettre à jour les priorités sans pagination
      loading: false
    };
  }),
  
  
  
  
);

// Selector
export function reducer(state: PrioriteState | undefined, action: Action) {
  return PrioriteReducer(state, action);
}