import { Action, createReducer, on } from '@ngrx/store';
import { 
  addagenceDataSuccess, 
  deleteagenceSuccess,
  deletemultipleagenceSuccess,
  fetchagenceData, 
  fetchagenceFailure, 
  fetchagenceSuccess, 
  updateagenceDataSuccess,
  fetchagenceNoPaginateSuccess
} from './agence.action';
import { AgencelistModel } from './agence.model';

export interface AgenceState {
  agencedata: AgencelistModel[];
  allAgences: AgencelistModel[]; 
  totalItems: number;
  next: string | null;
  previous: string | null;
  loading: boolean;
  error: any;
  currentPage: number;
}

export const initialState: AgenceState = {
  agencedata: [],
  allAgences: [],
  totalItems: 0,
  next: null,
  previous: null,
  loading: false,
  error: null,
  currentPage: 1
};

export const AgenceReducer = createReducer(
  initialState,
  on(fetchagenceData, (state, { page }) => {
    return { ...state, loading: true, error: null, currentPage: page || state.currentPage };
  }),
  on(fetchagenceSuccess, (state, { response }) => {
    return { 
      ...state, 
      agencedata: response.results, 
      totalItems: response.count,
      next: response.next,
      previous: response.previous,
      loading: false 
    };
  }),
  on(fetchagenceFailure, (state, { error }) => {
    return { ...state, error, loading: false };
  }),
   
  on(addagenceDataSuccess, (state, { newData }) => {
    return { ...state, error: null };
  }),
  on(updateagenceDataSuccess, (state, { updatedData }) => {
    return { ...state, error: null };
  }),
   
  on(deleteagenceSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),
  
  on(deletemultipleagenceSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),

  on(fetchagenceNoPaginateSuccess, (state, { response }) => {
        return {
          ...state,
          allAgences: response, // Mettre à jour les priorités sans pagination
          loading: false
        };
      }),
);

// Selector
export function reducer(state: AgenceState | undefined, action: Action) {
  return AgenceReducer(state, action);
}