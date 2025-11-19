import { createAction, props } from '@ngrx/store';
import { PlatModel, ApiResponse, StatistiqueGlobale, PlatUploadPayload  } from './plat.model';

// fetch plat Data
export const fetchplatData = createAction(
    '[Data] Fetch plat Table Data',
    props<{ page?: number }>()
);

export const fetchplatSuccess = createAction(
  '[Data] Fetch plat Data Success',
  props<{ response: ApiResponse<PlatModel> }>()
);

export const fetchplatFailure = createAction(
  '[Data] Fetch plat Data Failure',
  props<{ error: string }>()
);


// fetch statistique plat Data
export const fetchstatistiqueplatData = createAction(
  '[Data] Fetch statistique plat Data'
);

export const fetchstatistiqueplatSuccess = createAction(
  '[Data] Fetch statistique plat Data Success',
  props<{ response: StatistiqueGlobale }>()
);

export const fetchstatistiqueplatFailure = createAction(
  '[Data] Fetch statistique plat Data Failure',
  props<{ error: string }>()
);


// Add Data
export const addplatData = createAction(
  '[Data] Add platData',
  props<{ newData: PlatModel }>()
);

export const addplatDataSuccess = createAction(
  '[Data] Add platData Success',
  props<{ newData: PlatModel }>()
);

export const addplatDataFailure = createAction(
  '[Data] Add platData Failure',
  props<{ error: string }>()
);

// Add no auth Data
export const addNoAuthplatData = createAction(
  '[Data] Add platData NoAuth',
  props<{ newData: PlatModel | FormData }>() // ✅ accepte les deux formats
);

export const addNoAuthplatDataSuccess = createAction(
  '[Data] Add platData NoAuth Success',
  props<{ newData: PlatModel | FormData }>()
);

export const addNoAuthplatDataFailure = createAction(
  '[Data] Add platData NoAuth Failure',
  props<{ error: string }>()
);

// Update Data
export const updateplatData = createAction(
  '[Data] Update platData',
  props<{ updatedData: PlatModel }>()
);

export const updateplatDataSuccess = createAction(
  '[Data] Update platData Success',
  props<{ updatedData: PlatModel }>()
);

export const updateplatDataFailure = createAction(
  '[Data] Update platData Failure',
  props<{ error: string }>()
);

// Delete Data (Single)
export const deleteplatData = createAction(
  '[Data] Delete platData',
  props<{ id: string }>()
);

export const deleteplatSuccess = createAction(
  '[Data] Delete platData Success',
  props<{ id: string }>()
);

export const deleteplatFailure = createAction(
  '[Data] Delete platData Failure',
  props<{ error: string }>()
);

// Delete Multiple
export const deletemultipleplatData = createAction(
  '[Data] Delete Multiple platData',
  props<{ id: string }>()
);

export const deletemultipleplatSuccess = createAction(
  '[Data] Delete Multiple platData Success',
  props<{ id: string }>()
);

export const deletemultipleplatFailure = createAction(
  '[Data] Delete Multiple platData Failure',
  props<{ error: string }>()
);

//Upload file
export const createPlatWithFiles = createAction(
  '[Plat] Create Plat With Files',
  props<{ newData: FormData }>()
);

export const createPlatWithFilesSuccess = createAction(
  '[Plat] Create Plat With Files Success',
  props<{ plat: any }>() // remplace `any` par le bon modèle si tu en as un
);

export const createPlatWithFilesFailure = createAction(
  '[Plat] Create Plat With Files Failure',
  props<{ error: string }>()
);

// update Plat File
export const updatePlatWithFiles = createAction(
  '[Plat] Update Plat With Files',
  props<{ id: number, updatedData: FormData }>()
);

export const updatePlatWithFilesSuccess = createAction(
  '[Plat] Update Plat With Files Success',
  props<{ updatedPlat: any }>() // Tu peux typer selon ton modèle exact
);

export const updatePlatWithFilesFailure = createAction(
  '[Plat] Update Plat With Files Failure',
  props<{ error: string }>()
);


