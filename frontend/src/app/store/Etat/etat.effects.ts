import { Injectable } from "@angular/core";
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CrudService } from "src/app/core/services/crud.service";
import { EtatService } from "src/app/core/services/etat/etat.service"; 
import { 
  addetatData,
  addetatDataFailure,
  addetatDataSuccess,

  deleteetatData,
  deleteetatFailure,
  deleteetatSuccess,
  
  deletemultipleetatData,
  deletemultipleetatSuccess,
  deletemultipleetatFailure,
  
  fetchetatData,
  fetchetatFailure,
  fetchetatSuccess,

  updateetatData,
  updateetatDataFailure,
  updateetatDataSuccess
} from "./etat.action";

@Injectable()
export class EtatEffects {
    
    fetchlistData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchetatData),
            mergeMap(({ page }) =>
                this.EtatService.getAllEtats(page || 1).pipe(
                    map((response) => {
                        console.log("Données chargées:", response);
                        return fetchetatSuccess({ response });
                    }),
                    catchError((error) => {
                        console.error("Erreur lors du chargement des données:", error);
                        return of(fetchetatFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Ajouter une etat
    addData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addetatData),
            mergeMap(({ newData }) =>
                this.EtatService.createEtat(newData).pipe(
                    map((response) => addetatDataSuccess({ newData: response })),
                    catchError((error) => {
                        console.error("Erreur lors de l'ajout:", error);
                        return of(addetatDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après ajout
    addSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addetatDataSuccess),
            map(() => fetchetatData({ page: 1 }))  // Retour à la première page après ajout
        )
    );

    // Mettre à jour une etat
    updateData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateetatData),
            mergeMap(({ updatedData }) =>
                this.EtatService.updateEtat(updatedData).pipe(
                    map(() => updateetatDataSuccess({ updatedData })),
                    catchError((error) => {
                        console.error("Erreur lors de la mise à jour:", error);
                        return of(updateetatDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après mise à jour
    updateSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateetatDataSuccess),
            mergeMap(() => this.EtatService.getCurrentPageInfo().pipe(
                map(({ currentPage }) => {
                    console.log("Mise à jour réussie, rechargement de la page", currentPage);
                    // Utiliser explicitement le numéro de page actuel
                    return fetchetatData({ page: currentPage });
                })
            ))
        )
    );

    // Supprimer une etat
    deleteData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteetatData),
            mergeMap(({ id }) =>
                this.EtatService.deleteEtat(id).pipe(
                    map(() => deleteetatSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression:", error);
                        return of(deleteetatFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après suppression d'une etat
    deleteSingleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteetatSuccess),
            mergeMap(() => this.EtatService.getCurrentPageInfo().pipe(
                map(({ currentPage, totalItems, itemsPerPage }) => {
                    console.log("Suppression réussie, vérification de la pagination");
                    
                    // Calculer le nombre total de pages après suppression
                    const totalPages = Math.ceil((totalItems - 1) / itemsPerPage);
                    
                    // Si currentPage > totalPages, revenir à la dernière page disponible
                    if (currentPage > totalPages) {
                        console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                        return fetchetatData({ page: totalPages > 0 ? totalPages : 1 });
                    } else {
                        // Sinon, rester sur la page actuelle
                        console.log(`Maintien sur la page ${currentPage}`);
                        return fetchetatData({ page: currentPage });
                    }
                }),
                catchError(error => {
                    console.error("Erreur lors de la vérification de pagination:", error);
                    // En cas d'erreur, charger la première page
                    return of(fetchetatData({ page: 1 }));
                })
            ))
        )
    );

    // Supprimer plusieurs etat
    deleteMultipleData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultipleetatData),
            mergeMap(({ id }) => {
                // S'assurer que l'ID est bien formaté
                if (!id || id.trim() === '') {
                    console.error("Aucun ID valide pour la suppression multiple");
                    return of(deletemultipleetatFailure({ error: "Aucun ID valide" }));
                }
                
                const idArray = id.split(',')
                    .filter(idStr => idStr.trim() !== '')
                    .map(idStr => parseInt(idStr.trim()))
                    .filter(id => !isNaN(id));
                
                console.log("Suppression multiple des IDs:", idArray);
                
                if (idArray.length === 0) {
                    console.error("Aucun ID valide après conversion");
                    return of(deletemultipleetatFailure({ error: "Aucun ID valide après conversion" }));
                }
                
                return this.EtatService.deleteMultipleEtat(idArray).pipe(
                    map(() => deletemultipleetatSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression multiple:", error);
                        return of(deletemultipleetatFailure({ error: error.toString() }));
                    })
                );
            })
        )
    );

    // Récharger après suppression multiple
    deletemultipleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultipleetatSuccess),
            mergeMap(({ id }) => {
                const deletedCount = id.split(',').filter(i => i.trim() !== '').length;
                
                return this.EtatService.getCurrentPageInfo().pipe(
                    map(({ currentPage, totalItems, itemsPerPage }) => {
                        console.log("Suppression multiple réussie, vérification de la pagination");
                        console.log(`Items supprimés: ${deletedCount}, totalItems: ${totalItems}, page actuelle: ${currentPage}`);
                        
                        // Calculer le nombre total de pages après suppression multiple
                        const totalPages = Math.ceil((totalItems - deletedCount) / itemsPerPage);
                        
                        // Si currentPage > totalPages, revenir à la dernière page disponible
                        if (currentPage > totalPages) {
                            console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                            return fetchetatData({ page: totalPages > 0 ? totalPages : 1 });
                        } else {
                            // Sinon, rester sur la page actuelle
                            console.log(`Maintien sur la page ${currentPage}`);
                            return fetchetatData({ page: currentPage });
                        }
                    }),
                    catchError(error => {
                        console.error("Erreur lors de la vérification de pagination:", error);
                        // En cas d'erreur, charger la première page
                        return of(fetchetatData({ page: 1 }));
                    })
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private CrudService: CrudService,
        private EtatService: EtatService
    ) { }
}