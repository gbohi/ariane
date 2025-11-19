import { Action, createReducer, on } from '@ngrx/store';
import { 
  adddepartementDataSuccess, 
  deletedepartementSuccess,
  deletemultipledepartementSuccess,
  fetchdepartementData, 
  fetchdepartementFailure, 
  fetchdepartementSuccess, 
  updatedepartementDataSuccess 
} from './departement.action';
import { DepartementlistModel } from './departement.model';

export interface DepartementState {
  departementdata: DepartementlistModel[];
  totalItems: number;
  next: string | null;
  previous: string | null;
  loading: boolean;
  error: any;
  currentPage: number;
}

export const initialState: DepartementState = {
  departementdata: [],
  totalItems: 0,
  next: null,
  previous: null,
  loading: false,
  error: null,
  currentPage: 1
};

export const DepartementReducer = createReducer(
  initialState,
  on(fetchdepartementData, (state, { page }) => {
    return { ...state, loading: true, error: null, currentPage: page || state.currentPage };
  }),
  on(fetchdepartementSuccess, (state, { response }) => {
    return { 
      ...state, 
      departementdata: response.results, 
      totalItems: response.count,
      next: response.next,
      previous: response.previous,
      loading: false 
    };
  }),
  on(fetchdepartementFailure, (state, { error }) => {
    return { ...state, error, loading: false };
  }),
   
  on(adddepartementDataSuccess, (state, { newData }) => {
    return { ...state, error: null };
  }),
  on(updatedepartementDataSuccess, (state, { updatedData }) => {
    return { ...state, error: null };
  }),
   
  on(deletedepartementSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),
  
  on(deletemultipledepartementSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),
);

// Selector
export function reducer(state: DepartementState | undefined, action: Action) {
  return DepartementReducer(state, action);
}