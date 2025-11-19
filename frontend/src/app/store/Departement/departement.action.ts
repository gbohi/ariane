import { createAction, props } from '@ngrx/store';
import { DepartementlistModel, ApiResponse } from './departement.model';

// fetch departement Data
export const fetchdepartementData = createAction(
    '[Data] Fetch departement Table Data',
    props<{ page?: number }>()
);

export const fetchdepartementSuccess = createAction(
  '[Data] Fetch departement Data Success',
  props<{ response: ApiResponse<DepartementlistModel> }>()
);

export const fetchdepartementFailure = createAction(
  '[Data] Fetch departement Data Failure',
  props<{ error: string }>()
);

// Add Data
export const adddepartementData = createAction(
  '[Data] Add departementData',
  props<{ newData: DepartementlistModel }>()
);

export const adddepartementDataSuccess = createAction(
  '[Data] Add departementData Success',
  props<{ newData: DepartementlistModel }>()
);

export const adddepartementDataFailure = createAction(
  '[Data] Add departementData Failure',
  props<{ error: string }>()
);

// Update Data
export const updatedepartementData = createAction(
  '[Data] Update departementData',
  props<{ updatedData: DepartementlistModel }>()
);

export const updatedepartementDataSuccess = createAction(
  '[Data] Update departementData Success',
  props<{ updatedData: DepartementlistModel }>()
);

export const updatedepartementDataFailure = createAction(
  '[Data] Update departementData Failure',
  props<{ error: string }>()
);

// Delete Data (Single)
export const deletedepartementData = createAction(
  '[Data] Delete departementData',
  props<{ id: string }>()
);

export const deletedepartementSuccess = createAction(
  '[Data] Delete departementData Success',
  props<{ id: string }>()
);

export const deletedepartementFailure = createAction(
  '[Data] Delete departementData Failure',
  props<{ error: string }>()
);

// Delete Multiple
export const deletemultipledepartementData = createAction(
  '[Data] Delete Multiple departementData',
  props<{ id: string }>()
);

export const deletemultipledepartementSuccess = createAction(
  '[Data] Delete Multiple departementData Success',
  props<{ id: string }>()
);

export const deletemultipledepartementFailure = createAction(
  '[Data] Delete Multiple departementData Failure',
  props<{ error: string }>()
);