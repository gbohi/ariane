import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DepartementState } from './departement.reducer';

export const selectDepartementState = createFeatureSelector<DepartementState>('departement');

export const selectdepartementData = createSelector(
    selectDepartementState,
    (state) => state.departementdata
);

export const selectLoading = createSelector(
    selectDepartementState,
    (state) => state.loading
);

export const selectTotalItems = createSelector(
    selectDepartementState,
    (state) => state.totalItems
);

export const selectCurrentPage = createSelector(
    selectDepartementState,
    (state) => state.currentPage
);

export const selectNextPage = createSelector(
    selectDepartementState,
    (state) => state.next
);

export const selectPreviousPage = createSelector(
    selectDepartementState,
    (state) => state.previous
);