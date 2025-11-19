import { Injectable } from "@angular/core";
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CrudService } from "src/app/core/services/crud.service";
import { StatutService } from "src/app/core/services/statut/statut.service";
import { 
  addstatutData,
  addstatutDataFailure,
  addstatutDataSuccess,

  deletestatutData,
  deletestatutFailure,
  deletestatutSuccess,
  
  deletemultiplestatutData,
  deletemultiplestatutSuccess,
  deletemultiplestatutFailure,
  
  fetchstatutData,
  fetchstatutFailure,
  fetchstatutSuccess,

  updatestatutData,
  updatestatutDataFailure,
  updatestatutDataSuccess,

  fetchstatutNoPaginateData,
  fetchstatutNoPaginateSuccess,
  fetchstatutNoPaginateFailure
} from "./statut.action";

@Injectable()
export class StatutEffects {
    
    fetchlistData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchstatutData),
            mergeMap(({ page }) =>
                this.statutService.getAllStatuts(page || 1).pipe(
                    map((response) => {
                        console.log("Données chargées:", response);
                        return fetchstatutSuccess({ response });
                    }),
                    catchError((error) => {
                        console.error("Erreur lors du chargement des données:", error);
                        return of(fetchstatutFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    //Liste sans pagination
        fetchlistNoPaginData$ = createEffect(() =>
                this.actions$.pipe(
                  ofType(fetchstatutNoPaginateData),
                  mergeMap(() =>
                    this.statutService.getListStatut().pipe(
                      map((response) => fetchstatutNoPaginateSuccess({ response })),
                      catchError((error) => of(fetchstatutNoPaginateFailure({ error: error.toString() })))
                    )
                  )
                )
              );

    // Ajouter une statut
    addData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addstatutData),
            mergeMap(({ newData }) =>
                this.statutService.createStatut(newData).pipe(
                    map((response) => addstatutDataSuccess({ newData: response })),
                    catchError((error) => {
                        console.error("Erreur lors de l'ajout:", error);
                        return of(addstatutDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après ajout
    addSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addstatutDataSuccess),
            map(() => fetchstatutData({ page: 1 }))  // Retour à la première page après ajout
        )
    );

    // Mettre à jour une statut
    updateData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updatestatutData),
            mergeMap(({ updatedData }) =>
                this.statutService.updateStatut(updatedData).pipe(
                    map(() => updatestatutDataSuccess({ updatedData })),
                    catchError((error) => {
                        console.error("Erreur lors de la mise à jour:", error);
                        return of(updatestatutDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après mise à jour
    updateSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updatestatutDataSuccess),
            mergeMap(() => this.statutService.getCurrentPageInfo().pipe(
                map(({ currentPage }) => {
                    console.log("Mise à jour réussie, rechargement de la page", currentPage);
                    // Utiliser explicitement le numéro de page actuel
                    return fetchstatutData({ page: currentPage });
                })
            ))
        )
    );

    // Supprimer une statut
    deleteData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletestatutData),
            mergeMap(({ id }) =>
                this.statutService.deleteStatut(id).pipe(
                    map(() => deletestatutSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression:", error);
                        return of(deletestatutFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après suppression d'une statut
    deleteSingleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletestatutSuccess),
            mergeMap(() => this.statutService.getCurrentPageInfo().pipe(
                map(({ currentPage, totalItems, itemsPerPage }) => {
                    console.log("Suppression réussie, vérification de la pagination");
                    
                    // Calculer le nombre total de pages après suppression
                    const totalPages = Math.ceil((totalItems - 1) / itemsPerPage);
                    
                    // Si currentPage > totalPages, revenir à la dernière page disponible
                    if (currentPage > totalPages) {
                        console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                        return fetchstatutData({ page: totalPages > 0 ? totalPages : 1 });
                    } else {
                        // Sinon, rester sur la page actuelle
                        console.log(`Maintien sur la page ${currentPage}`);
                        return fetchstatutData({ page: currentPage });
                    }
                }),
                catchError(error => {
                    console.error("Erreur lors de la vérification de pagination:", error);
                    // En cas d'erreur, charger la première page
                    return of(fetchstatutData({ page: 1 }));
                })
            ))
        )
    );

    // Supprimer plusieurs statut
    deleteMultipleData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultiplestatutData),
            mergeMap(({ id }) => {
                // S'assurer que l'ID est bien formaté
                if (!id || id.trim() === '') {
                    console.error("Aucun ID valide pour la suppression multiple");
                    return of(deletemultiplestatutFailure({ error: "Aucun ID valide" }));
                }
                
                const idArray = id.split(',')
                    .filter(idStr => idStr.trim() !== '')
                    .map(idStr => parseInt(idStr.trim()))
                    .filter(id => !isNaN(id));
                
                console.log("Suppression multiple des IDs:", idArray);
                
                if (idArray.length === 0) {
                    console.error("Aucun ID valide après conversion");
                    return of(deletemultiplestatutFailure({ error: "Aucun ID valide après conversion" }));
                }
                
                return this.statutService.deleteMultipleStatut(idArray).pipe(
                    map(() => deletemultiplestatutSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression multiple:", error);
                        return of(deletemultiplestatutFailure({ error: error.toString() }));
                    })
                );
            })
        )
    );

    // Récharger après suppression multiple
    deletemultipleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultiplestatutSuccess),
            mergeMap(({ id }) => {
                const deletedCount = id.split(',').filter(i => i.trim() !== '').length;
                
                return this.statutService.getCurrentPageInfo().pipe(
                    map(({ currentPage, totalItems, itemsPerPage }) => {
                        console.log("Suppression multiple réussie, vérification de la pagination");
                        console.log(`Items supprimés: ${deletedCount}, totalItems: ${totalItems}, page actuelle: ${currentPage}`);
                        
                        // Calculer le nombre total de pages après suppression multiple
                        const totalPages = Math.ceil((totalItems - deletedCount) / itemsPerPage);
                        
                        // Si currentPage > totalPages, revenir à la dernière page disponible
                        if (currentPage > totalPages) {
                            console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                            return fetchstatutData({ page: totalPages > 0 ? totalPages : 1 });
                        } else {
                            // Sinon, rester sur la page actuelle
                            console.log(`Maintien sur la page ${currentPage}`);
                            return fetchstatutData({ page: currentPage });
                        }
                    }),
                    catchError(error => {
                        console.error("Erreur lors de la vérification de pagination:", error);
                        // En cas d'erreur, charger la première page
                        return of(fetchstatutData({ page: 1 }));
                    })
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private CrudService: CrudService,
        private statutService: StatutService
    ) { }
}