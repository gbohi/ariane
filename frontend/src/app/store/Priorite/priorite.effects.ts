import { Injectable } from "@angular/core";
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CrudService } from "src/app/core/services/crud.service";
import { PrioriteService } from "src/app/core/services/priorite/priorite.service"; 
import { 
  addprioriteData,
  addprioriteDataFailure,
  addprioriteDataSuccess,

  deleteprioriteData,
  deleteprioriteFailure,
  deleteprioriteSuccess,
  
  deletemultipleprioriteData,
  deletemultipleprioriteSuccess,
  deletemultipleprioriteFailure,
  
  fetchprioriteData,
  fetchprioriteFailure,
  fetchprioriteSuccess,

  updateprioriteData,
  updateprioriteDataFailure,
  updateprioriteDataSuccess,

  fetchprioriteNoPaginateData,
  fetchprioriteNoPaginateSuccess,
  fetchprioriteNoPaginateFailure
} from "./priorite.action";

@Injectable()
export class PrioriteEffects {
    
    fetchlistData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchprioriteData),
            mergeMap(({ page }) =>
                this.prioriteService.getAllPriorites(page || 1).pipe(
                    map((response) => {
                        console.log("Données chargées:", response);
                        return fetchprioriteSuccess({ response });
                    }),
                    catchError((error) => {
                        console.error("Erreur lors du chargement des données:", error);
                        return of(fetchprioriteFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    fetchlistNoPaginData$ = createEffect(() =>
        this.actions$.pipe(
          ofType(fetchprioriteNoPaginateData),
          mergeMap(() =>
            this.prioriteService.getListPriorites().pipe(
              map((response) => fetchprioriteNoPaginateSuccess({ response })),
              catchError((error) => of(fetchprioriteNoPaginateFailure({ error: error.toString() })))
            )
          )
        )
      );
      

    // Ajouter une priorité
    addData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addprioriteData),
            mergeMap(({ newData }) =>
                this.prioriteService.createPriorite(newData).pipe(
                    map((response) => addprioriteDataSuccess({ newData: response })),
                    catchError((error) => {
                        console.error("Erreur lors de l'ajout:", error);
                        return of(addprioriteDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après ajout
    addSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addprioriteDataSuccess),
            map(() => fetchprioriteData({ page: 1 }))  // Retour à la première page après ajout
        )
    );

    // Mettre à jour une priorité
    updateData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateprioriteData),
            mergeMap(({ updatedData }) =>
                this.prioriteService.updatePriorite(updatedData).pipe(
                    map(() => updateprioriteDataSuccess({ updatedData })),
                    catchError((error) => {
                        console.error("Erreur lors de la mise à jour:", error);
                        return of(updateprioriteDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après mise à jour
    updateSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateprioriteDataSuccess),
            mergeMap(() => this.prioriteService.getCurrentPageInfo().pipe(
                map(({ currentPage }) => {
                    console.log("Mise à jour réussie, rechargement de la page", currentPage);
                    // Utiliser explicitement le numéro de page actuel
                    return fetchprioriteData({ page: currentPage });
                })
            ))
        )
    );

    // Supprimer une priorité
    deleteData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteprioriteData),
            mergeMap(({ id }) =>
                this.prioriteService.deletePriorite(id).pipe(
                    map(() => deleteprioriteSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression:", error);
                        return of(deleteprioriteFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après suppression d'une priorité
    deleteSingleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteprioriteSuccess),
            mergeMap(() => this.prioriteService.getCurrentPageInfo().pipe(
                map(({ currentPage, totalItems, itemsPerPage }) => {
                    console.log("Suppression réussie, vérification de la pagination");
                    
                    // Calculer le nombre total de pages après suppression
                    const totalPages = Math.ceil((totalItems - 1) / itemsPerPage);
                    
                    // Si currentPage > totalPages, revenir à la dernière page disponible
                    if (currentPage > totalPages) {
                        console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                        return fetchprioriteData({ page: totalPages > 0 ? totalPages : 1 });
                    } else {
                        // Sinon, rester sur la page actuelle
                        console.log(`Maintien sur la page ${currentPage}`);
                        return fetchprioriteData({ page: currentPage });
                    }
                }),
                catchError(error => {
                    console.error("Erreur lors de la vérification de pagination:", error);
                    // En cas d'erreur, charger la première page
                    return of(fetchprioriteData({ page: 1 }));
                })
            ))
        )
    );

    // Supprimer plusieurs priorités
    deleteMultipleData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultipleprioriteData),
            mergeMap(({ id }) => {
                // S'assurer que l'ID est bien formaté
                if (!id || id.trim() === '') {
                    console.error("Aucun ID valide pour la suppression multiple");
                    return of(deletemultipleprioriteFailure({ error: "Aucun ID valide" }));
                }
                
                const idArray = id.split(',')
                    .filter(idStr => idStr.trim() !== '')
                    .map(idStr => parseInt(idStr.trim()))
                    .filter(id => !isNaN(id));
                
                console.log("Suppression multiple des IDs:", idArray);
                
                if (idArray.length === 0) {
                    console.error("Aucun ID valide après conversion");
                    return of(deletemultipleprioriteFailure({ error: "Aucun ID valide après conversion" }));
                }
                
                return this.prioriteService.deleteMultiplePriorite(idArray).pipe(
                    map(() => deletemultipleprioriteSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression multiple:", error);
                        return of(deletemultipleprioriteFailure({ error: error.toString() }));
                    })
                );
            })
        )
    );

    // Récharger après suppression multiple
    deletemultipleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultipleprioriteSuccess),
            mergeMap(({ id }) => {
                const deletedCount = id.split(',').filter(i => i.trim() !== '').length;
                
                return this.prioriteService.getCurrentPageInfo().pipe(
                    map(({ currentPage, totalItems, itemsPerPage }) => {
                        console.log("Suppression multiple réussie, vérification de la pagination");
                        console.log(`Items supprimés: ${deletedCount}, totalItems: ${totalItems}, page actuelle: ${currentPage}`);
                        
                        // Calculer le nombre total de pages après suppression multiple
                        const totalPages = Math.ceil((totalItems - deletedCount) / itemsPerPage);
                        
                        // Si currentPage > totalPages, revenir à la dernière page disponible
                        if (currentPage > totalPages) {
                            console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                            return fetchprioriteData({ page: totalPages > 0 ? totalPages : 1 });
                        } else {
                            // Sinon, rester sur la page actuelle
                            console.log(`Maintien sur la page ${currentPage}`);
                            return fetchprioriteData({ page: currentPage });
                        }
                    }),
                    catchError(error => {
                        console.error("Erreur lors de la vérification de pagination:", error);
                        // En cas d'erreur, charger la première page
                        return of(fetchprioriteData({ page: 1 }));
                    })
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private CrudService: CrudService,
        private prioriteService: PrioriteService
    ) { }
}