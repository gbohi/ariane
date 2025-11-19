import { Action, createReducer, on } from '@ngrx/store';
import { 
  addstatutDataSuccess, 
  deletestatutSuccess,
  deletemultiplestatutSuccess,
  fetchstatutData, 
  fetchstatutFailure, 
  fetchstatutSuccess, 
  updatestatutDataSuccess,
  fetchstatutNoPaginateSuccess 
} from './statut.action';
import { StatutlistModel } from './statut.model';

export interface StatutState {
  statutdata: StatutlistModel[];
  allStatuts: StatutlistModel[];
  totalItems: number;
  next: string | null;
  previous: string | null;
  loading: boolean;
  error: any;
  currentPage: number;
}

export const initialState: StatutState = {
  statutdata: [],
  allStatuts: [], 
  totalItems: 0,
  next: null,
  previous: null,
  loading: false,
  error: null,
  currentPage: 1
};

export const StatutReducer = createReducer(
  initialState,
  on(fetchstatutData, (state, { page }) => {
    return { ...state, loading: true, error: null, currentPage: page || state.currentPage };
  }),
  on(fetchstatutSuccess, (state, { response }) => {
    return { 
      ...state, 
      statutdata: response.results, 
      totalItems: response.count,
      next: response.next,
      previous: response.previous,
      loading: false 
    };
  }),
  on(fetchstatutFailure, (state, { error }) => {
    return { ...state, error, loading: false };
  }),
   
  on(addstatutDataSuccess, (state, { newData }) => {
    return { ...state, error: null };
  }),
  on(updatestatutDataSuccess, (state, { updatedData }) => {
    return { ...state, error: null };
  }),
   
  on(deletestatutSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),
  
  on(deletemultiplestatutSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),

  on(fetchstatutNoPaginateSuccess, (state, { response }) => {
        return {
          ...state,
          allStatuts: response, // Mettre à jour les statut sans pagination
          loading: false
        };
      }),
);

// Selector
export function reducer(state: StatutState | undefined, action: Action) {
  return StatutReducer(state, action);
}