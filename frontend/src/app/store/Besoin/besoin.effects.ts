import { Injectable } from "@angular/core";
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CrudService } from "src/app/core/services/crud.service";
import { BesoinService } from "src/app/core/services/besoin/besoin.service";
import { 
  addbesoinData,
  addbesoinDataFailure,
  addbesoinDataSuccess,

  addNoAuthbesoinData,
  addNoAuthbesoinDataFailure,
  addNoAuthbesoinDataSuccess,

  deletebesoinData,
  deletebesoinFailure,
  deletebesoinSuccess,
  
  deletemultiplebesoinData,
  deletemultiplebesoinSuccess,
  deletemultiplebesoinFailure,
  
  fetchbesoinData,
  fetchbesoinFailure,
  fetchbesoinSuccess,

  updatebesoinData,
  updatebesoinDataFailure,
  updatebesoinDataSuccess,

  fetchstatistiquebesoinData,
  fetchstatistiquebesoinSuccess,
  fetchstatistiquebesoinFailure
} from "./besoin.action";

@Injectable()
export class BesoinEffects {
    
    fetchlistData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchbesoinData),
            mergeMap(({ page }) =>
                this.BesoinService.getAllBesoins(page || 1).pipe(
                    map((response) => {
                        console.log("Données chargées:", response);
                        return fetchbesoinSuccess({ response });
                    }),
                    catchError((error) => {
                        console.error("Erreur lors du chargement des données:", error);
                        return of(fetchbesoinFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Ajouter une besoin
    addData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addbesoinData),
            mergeMap(({ newData }) =>
                this.BesoinService.createBesoin(newData).pipe(
                    map((response) => addbesoinDataSuccess({ newData: response })),
                    catchError((error) => {
                        console.error("Erreur lors de l'ajout:", error);
                        return of(addbesoinDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Ajouter un sans authentification besoin
    /*addNoAuthData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addNoAuthbesoinData),
            mergeMap(({ newData }) =>
                this.BesoinService.createNoAuthBesoin(newData).pipe(
                    map((response) => addNoAuthbesoinDataSuccess({ newData: response })),
                    catchError((error) => {
                        console.error("Erreur lors de l'ajout:", error);
                        return of(addNoAuthbesoinDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );*/

    addNoAuthData$ = createEffect(() =>
        this.actions$.pipe(
          ofType(addNoAuthbesoinData),
          mergeMap(({ newData }) =>
            this.BesoinService.createNoAuthBesoin(newData as FormData).pipe(   // 👈 ici cast en FormData
              map((response) => addNoAuthbesoinDataSuccess({ newData: response })),
              catchError((error) => {
                console.error('Erreur lors de l\'ajout:', error);
                return of(addNoAuthbesoinDataFailure({ error: error.toString() }));
              })
            )
          )
        )
      );
      
      fetchStatistiqueGlobale$ = createEffect(() =>
        this.actions$.pipe(
          ofType(fetchstatistiquebesoinData),
          mergeMap(() =>
            this.BesoinService.getStatistiquesGlobales().pipe(
              map((response) => fetchstatistiquebesoinSuccess({ response })),
              catchError((error) =>
                of(fetchstatistiquebesoinFailure({ error: error.message }))
              )
            )
          )
        )
      );
        
      

    // Récharger après ajout
    addSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addbesoinDataSuccess),
            map(() => fetchbesoinData({ page: 1 }))  // Retour à la première page après ajout
        )
    );

    // Mettre à jour une besoin
    updateData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updatebesoinData),
            mergeMap(({ updatedData }) =>
                this.BesoinService.updateBesoin(updatedData).pipe(
                    map(() => updatebesoinDataSuccess({ updatedData })),
                    catchError((error) => {
                        console.error("Erreur lors de la mise à jour:", error);
                        return of(updatebesoinDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après mise à jour
    updateSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updatebesoinDataSuccess),
            mergeMap(() => this.BesoinService.getCurrentPageInfo().pipe(
                map(({ currentPage }) => {
                    console.log("Mise à jour réussie, rechargement de la page", currentPage);
                    // Utiliser explicitement le numéro de page actuel
                    return fetchbesoinData({ page: currentPage });
                })
            ))
        )
    );

    // Supprimer un besoin
    deleteData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletebesoinData),
            mergeMap(({ id }) =>
                this.BesoinService.deleteBesoin(id).pipe(
                    map(() => deletebesoinSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression:", error);
                        return of(deletebesoinFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après suppression d'un besoin
    deleteSingleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletebesoinSuccess),
            mergeMap(() => this.BesoinService.getCurrentPageInfo().pipe(
                map(({ currentPage, totalItems, itemsPerPage }) => {
                    console.log("Suppression réussie, vérification de la pagination");
                    
                    // Calculer le nombre total de pages après suppression
                    const totalPages = Math.ceil((totalItems - 1) / itemsPerPage);
                    
                    // Si currentPage > totalPages, revenir à la dernière page disponible
                    if (currentPage > totalPages) {
                        console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                        return fetchbesoinData({ page: totalPages > 0 ? totalPages : 1 });
                    } else {
                        // Sinon, rester sur la page actuelle
                        console.log(`Maintien sur la page ${currentPage}`);
                        return fetchbesoinData({ page: currentPage });
                    }
                }),
                catchError(error => {
                    console.error("Erreur lors de la vérification de pagination:", error);
                    // En cas d'erreur, charger la première page
                    return of(fetchbesoinData({ page: 1 }));
                })
            ))
        )
    );

    // Supprimer plusieurs besoin
    deleteMultipleData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultiplebesoinData),
            mergeMap(({ id }) => {
                // S'assurer que l'ID est bien formaté
                if (!id || id.trim() === '') {
                    console.error("Aucun ID valide pour la suppression multiple");
                    return of(deletemultiplebesoinFailure({ error: "Aucun ID valide" }));
                }
                
                const idArray = id.split(',')
                    .filter(idStr => idStr.trim() !== '')
                    .map(idStr => parseInt(idStr.trim()))
                    .filter(id => !isNaN(id));
                
                console.log("Suppression multiple des IDs:", idArray);
                
                if (idArray.length === 0) {
                    console.error("Aucun ID valide après conversion");
                    return of(deletemultiplebesoinFailure({ error: "Aucun ID valide après conversion" }));
                }
                
                return this.BesoinService.deleteMultipleBesoin(idArray).pipe(
                    map(() => deletemultiplebesoinSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression multiple:", error);
                        return of(deletemultiplebesoinFailure({ error: error.toString() }));
                    })
                );
            })
        )
    );

    // Récharger après suppression multiple
    deletemultipleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultiplebesoinSuccess),
            mergeMap(({ id }) => {
                const deletedCount = id.split(',').filter(i => i.trim() !== '').length;
                
                return this.BesoinService.getCurrentPageInfo().pipe(
                    map(({ currentPage, totalItems, itemsPerPage }) => {
                        console.log("Suppression multiple réussie, vérification de la pagination");
                        console.log(`Items supprimés: ${deletedCount}, totalItems: ${totalItems}, page actuelle: ${currentPage}`);
                        
                        // Calculer le nombre total de pages après suppression multiple
                        const totalPages = Math.ceil((totalItems - deletedCount) / itemsPerPage);
                        
                        // Si currentPage > totalPages, revenir à la dernière page disponible
                        if (currentPage > totalPages) {
                            console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                            return fetchbesoinData({ page: totalPages > 0 ? totalPages : 1 });
                        } else {
                            // Sinon, rester sur la page actuelle
                            console.log(`Maintien sur la page ${currentPage}`);
                            return fetchbesoinData({ page: currentPage });
                        }
                    }),
                    catchError(error => {
                        console.error("Erreur lors de la vérification de pagination:", error);
                        // En cas d'erreur, charger la première page
                        return of(fetchbesoinData({ page: 1 }));
                    })
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private CrudService: CrudService,
        private BesoinService: BesoinService
    ) { }
}