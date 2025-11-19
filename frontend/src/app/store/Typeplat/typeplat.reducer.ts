import { Action, createReducer, on } from '@ngrx/store';
import { 
  addtypeplatDataSuccess, 
  deletetypeplatSuccess,
  deletemultipletypeplatSuccess,
  fetchtypeplatData, 
  fetchtypeplatFailure, 
  fetchtypeplatSuccess, 
  updatetypeplatDataSuccess,
  fetchtypeplatNoPaginateSuccess
} from './typeplat.action';
import { TypeplatlistModel } from './typeplat.model';

export interface TypeplatState {
  typeplatdata: TypeplatlistModel[];
  allTypeplats: TypeplatlistModel[];  
  totalItems: number;
  next: string | null;
  previous: string | null;
  loading: boolean;
  error: any;
  currentPage: number;
}

export const initialState: TypeplatState = {
  typeplatdata: [],
  allTypeplats: [],  
  totalItems: 0,
  next: null,
  previous: null,
  loading: false,
  error: null,
  currentPage: 1
};

export const TypeplatReducer = createReducer(
  initialState,
  on(fetchtypeplatData, (state, { page }) => {
    return { ...state, loading: true, error: null, currentPage: page || state.currentPage };
  }),
  on(fetchtypeplatSuccess, (state, { response }) => {
    return { 
      ...state, 
      typeplatdata: response.results, 
      totalItems: response.count,
      next: response.next,
      previous: response.previous,
      loading: false 
    };
  }),
  on(fetchtypeplatFailure, (state, { error }) => {
    return { ...state, error, loading: false };
  }),
   
  on(addtypeplatDataSuccess, (state, { newData }) => {
    return { ...state, error: null };
  }),
  on(updatetypeplatDataSuccess, (state, { updatedData }) => {
    return { ...state, error: null };
  }),
   
  on(deletetypeplatSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),
  
  on(deletemultipletypeplatSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),

  on(fetchtypeplatNoPaginateSuccess, (state, { response }) => {
      return {
        ...state,
        allTypeplats: response, // Mettre à jour les typeplat sans pagination
        loading: false
      };
    }),
);

// Selector
export function reducer(state: TypeplatState | undefined, action: Action) {
  return TypeplatReducer(state, action);
}