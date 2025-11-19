import { Injectable } from "@angular/core";
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CrudService } from "src/app/core/services/crud.service";
import { AgenceService } from "src/app/core/services/agence/agence.service";
import { 
  addagenceData,
  addagenceDataFailure,
  addagenceDataSuccess,

  deleteagenceData,
  deleteagenceFailure,
  deleteagenceSuccess,
  
  deletemultipleagenceData,
  deletemultipleagenceSuccess,
  deletemultipleagenceFailure,
  
  fetchagenceData,
  fetchagenceFailure,
  fetchagenceSuccess,

  updateagenceData,
  updateagenceDataFailure,
  updateagenceDataSuccess,

  fetchagenceNoPaginateData,
  fetchagenceNoPaginateSuccess,
  fetchagenceNoPaginateFailure
} from "./agence.action";

@Injectable()
export class AgenceEffects {
    
    fetchlistData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchagenceData),
            mergeMap(({ page }) =>
                this.AgenceService.getAllAgences(page || 1).pipe(
                    map((response) => {
                        console.log("Données chargées:", response);
                        return fetchagenceSuccess({ response });
                    }),
                    catchError((error) => {
                        console.error("Erreur lors du chargement des données:", error);
                        return of(fetchagenceFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    
        //Liste sans pagination
        fetchlistNoPaginData$ = createEffect(() =>
                this.actions$.pipe(
                  ofType(fetchagenceNoPaginateData),
                  mergeMap(() =>
                    this.AgenceService.getListAgences().pipe(
                        map((response) => {
                            console.log("Données chargées:", response);
                            return fetchagenceNoPaginateSuccess({ response });
                        }),
                      
                      catchError((error) => of(fetchagenceNoPaginateFailure({ error: error.toString() })))
                    )
                  )
                )
              );
    

    // Ajouter une agence
    addData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addagenceData),
            mergeMap(({ newData }) =>
                this.AgenceService.createAgence(newData).pipe(
                    map((response) => addagenceDataSuccess({ newData: response })),
                    catchError((error) => {
                        console.error("Erreur lors de l'ajout:", error);
                        return of(addagenceDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après ajout
    addSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addagenceDataSuccess),
            map(() => fetchagenceData({ page: 1 }))  // Retour à la première page après ajout
        )
    );

    // Mettre à jour une agence
    updateData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateagenceData),
            mergeMap(({ updatedData }) =>
                this.AgenceService.updateAgence(updatedData).pipe(
                    map(() => updateagenceDataSuccess({ updatedData })),
                    catchError((error) => {
                        console.error("Erreur lors de la mise à jour:", error);
                        return of(updateagenceDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après mise à jour
    updateSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateagenceDataSuccess),
            mergeMap(() => this.AgenceService.getCurrentPageInfo().pipe(
                map(({ currentPage }) => {
                    console.log("Mise à jour réussie, rechargement de la page", currentPage);
                    // Utiliser explicitement le numéro de page actuel
                    return fetchagenceData({ page: currentPage });
                })
            ))
        )
    );

    // Supprimer une agence
    deleteData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteagenceData),
            mergeMap(({ id }) =>
                this.AgenceService.deleteAgence(id).pipe(
                    map(() => deleteagenceSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression:", error);
                        return of(deleteagenceFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après suppression d'une agence
    deleteSingleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteagenceSuccess),
            mergeMap(() => this.AgenceService.getCurrentPageInfo().pipe(
                map(({ currentPage, totalItems, itemsPerPage }) => {
                    console.log("Suppression réussie, vérification de la pagination");
                    
                    // Calculer le nombre total de pages après suppression
                    const totalPages = Math.ceil((totalItems - 1) / itemsPerPage);
                    
                    // Si currentPage > totalPages, revenir à la dernière page disponible
                    if (currentPage > totalPages) {
                        console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                        return fetchagenceData({ page: totalPages > 0 ? totalPages : 1 });
                    } else {
                        // Sinon, rester sur la page actuelle
                        console.log(`Maintien sur la page ${currentPage}`);
                        return fetchagenceData({ page: currentPage });
                    }
                }),
                catchError(error => {
                    console.error("Erreur lors de la vérification de pagination:", error);
                    // En cas d'erreur, charger la première page
                    return of(fetchagenceData({ page: 1 }));
                })
            ))
        )
    );

    // Supprimer plusieurs agence
    deleteMultipleData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultipleagenceData),
            mergeMap(({ id }) => {
                // S'assurer que l'ID est bien formaté
                if (!id || id.trim() === '') {
                    console.error("Aucun ID valide pour la suppression multiple");
                    return of(deletemultipleagenceFailure({ error: "Aucun ID valide" }));
                }
                
                const idArray = id.split(',')
                    .filter(idStr => idStr.trim() !== '')
                    .map(idStr => parseInt(idStr.trim()))
                    .filter(id => !isNaN(id));
                
                console.log("Suppression multiple des IDs:", idArray);
                
                if (idArray.length === 0) {
                    console.error("Aucun ID valide après conversion");
                    return of(deletemultipleagenceFailure({ error: "Aucun ID valide après conversion" }));
                }
                
                return this.AgenceService.deleteMultipleAgence(idArray).pipe(
                    map(() => deletemultipleagenceSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression multiple:", error);
                        return of(deletemultipleagenceFailure({ error: error.toString() }));
                    })
                );
            })
        )
    );

    // Récharger après suppression multiple
    deletemultipleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultipleagenceSuccess),
            mergeMap(({ id }) => {
                const deletedCount = id.split(',').filter(i => i.trim() !== '').length;
                
                return this.AgenceService.getCurrentPageInfo().pipe(
                    map(({ currentPage, totalItems, itemsPerPage }) => {
                        console.log("Suppression multiple réussie, vérification de la pagination");
                        console.log(`Items supprimés: ${deletedCount}, totalItems: ${totalItems}, page actuelle: ${currentPage}`);
                        
                        // Calculer le nombre total de pages après suppression multiple
                        const totalPages = Math.ceil((totalItems - deletedCount) / itemsPerPage);
                        
                        // Si currentPage > totalPages, revenir à la dernière page disponible
                        if (currentPage > totalPages) {
                            console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                            return fetchagenceData({ page: totalPages > 0 ? totalPages : 1 });
                        } else {
                            // Sinon, rester sur la page actuelle
                            console.log(`Maintien sur la page ${currentPage}`);
                            return fetchagenceData({ page: currentPage });
                        }
                    }),
                    catchError(error => {
                        console.error("Erreur lors de la vérification de pagination:", error);
                        // En cas d'erreur, charger la première page
                        return of(fetchagenceData({ page: 1 }));
                    })
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private CrudService: CrudService,
        private AgenceService: AgenceService
    ) { }
}