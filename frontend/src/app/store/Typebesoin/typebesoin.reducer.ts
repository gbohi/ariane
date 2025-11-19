import { Action, createReducer, on } from '@ngrx/store';
import { 
  addtypebesoinDataSuccess, 
  deletetypebesoinSuccess,
  deletemultipletypebesoinSuccess,
  fetchtypebesoinData, 
  fetchtypebesoinFailure, 
  fetchtypebesoinSuccess, 
  updatetypebesoinDataSuccess,
  fetchtypebesoinNoPaginateSuccess
} from './typebesoin.action';
import { TypebesoinlistModel } from './typebesoin.model';

export interface TypebesoinState {
  typebesoindata: TypebesoinlistModel[];
  allTypebesoins: TypebesoinlistModel[];  
  totalItems: number;
  next: string | null;
  previous: string | null;
  loading: boolean;
  error: any;
  currentPage: number;
}

export const initialState: TypebesoinState = {
  typebesoindata: [],
  allTypebesoins: [],  
  totalItems: 0,
  next: null,
  previous: null,
  loading: false,
  error: null,
  currentPage: 1
};

export const TypebesoinReducer = createReducer(
  initialState,
  on(fetchtypebesoinData, (state, { page }) => {
    return { ...state, loading: true, error: null, currentPage: page || state.currentPage };
  }),
  on(fetchtypebesoinSuccess, (state, { response }) => {
    return { 
      ...state, 
      typebesoindata: response.results, 
      totalItems: response.count,
      next: response.next,
      previous: response.previous,
      loading: false 
    };
  }),
  on(fetchtypebesoinFailure, (state, { error }) => {
    return { ...state, error, loading: false };
  }),
   
  on(addtypebesoinDataSuccess, (state, { newData }) => {
    return { ...state, error: null };
  }),
  on(updatetypebesoinDataSuccess, (state, { updatedData }) => {
    return { ...state, error: null };
  }),
   
  on(deletetypebesoinSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),
  
  on(deletemultipletypebesoinSuccess, (state, { id }) => {
    return { ...state, error: null };
  }),

  on(fetchtypebesoinNoPaginateSuccess, (state, { response }) => {
      return {
        ...state,
        allTypebesoins: response, // Mettre à jour les typebesoin sans pagination
        loading: false
      };
    }),
);

// Selector
export function reducer(state: TypebesoinState | undefined, action: Action) {
  return TypebesoinReducer(state, action);
}