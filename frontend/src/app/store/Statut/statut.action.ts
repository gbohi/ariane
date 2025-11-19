import { createAction, props } from '@ngrx/store';
import { StatutlistModel, ApiResponse } from './statut.model';

// fetch statut data
export const fetchstatutData = createAction(
    '[Data] Fetch statut Table Data',
    props<{ page?: number }>()
);

export const fetchstatutSuccess = createAction(
  '[Data] Fetch statut Data Success',
  props<{ response: ApiResponse<StatutlistModel> }>()
);

export const fetchstatutFailure = createAction(
  '[Data] Fetch statut Data Failure',
  props<{ error: string }>()
);

// Add Data
export const addstatutData = createAction(
  '[Data] Add statutData',
  props<{ newData: StatutlistModel }>()
);

export const addstatutDataSuccess = createAction(
  '[Data] Add statutData Success',
  props<{ newData: StatutlistModel }>()
);

export const addstatutDataFailure = createAction(
  '[Data] Add statutData Failure',
  props<{ error: string }>()
);

// Update Data
export const updatestatutData = createAction(
  '[Data] Update statutData',
  props<{ updatedData: StatutlistModel }>()
);

export const updatestatutDataSuccess = createAction(
  '[Data] Update statutData Success',
  props<{ updatedData: StatutlistModel }>()
);

export const updatestatutDataFailure = createAction(
  '[Data] Update statutData Failure',
  props<{ error: string }>()
);

// Delete Data (Single)
export const deletestatutData = createAction(
  '[Data] Delete statutData',
  props<{ id: string }>()
);

export const deletestatutSuccess = createAction(
  '[Data] Delete statutData Success',
  props<{ id: string }>()
);

export const deletestatutFailure = createAction(
  '[Data] Delete statutData Failure',
  props<{ error: string }>()
);

// Delete Multiple
export const deletemultiplestatutData = createAction(
  '[Data] Delete Multiple statutData',
  props<{ id: string }>()
);

export const deletemultiplestatutSuccess = createAction(
  '[Data] Delete Multiple statutData Success',
  props<{ id: string }>()
);

export const deletemultiplestatutFailure = createAction(
  '[Data] Delete Multiple statutData Failure',
  props<{ error: string }>()
);

export const fetchstatutNoPaginateData = createAction(
  '[Statut] Fetch statut No Pagination'
);

export const fetchstatutNoPaginateSuccess = createAction(
  '[Statut API] Fetch All statut Success',
  props<{ response: StatutlistModel[] }>() // ✅ tableau directement
);


export const fetchstatutNoPaginateFailure = createAction(
  '[Statut] Fetch statut No Pagination Failure',
  props<{ error: string }>()
);