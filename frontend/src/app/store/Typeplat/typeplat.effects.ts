import { Injectable } from "@angular/core";
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CrudService } from "src/app/core/services/crud.service";
import { TypeplatService } from "src/app/core/services/typeplat/typeplat.service";
import { 
  addtypeplatData,
  addtypeplatDataFailure,
  addtypeplatDataSuccess,

  deletetypeplatData,
  deletetypeplatFailure,
  deletetypeplatSuccess,
  
  deletemultipletypeplatData,
  deletemultipletypeplatSuccess,
  deletemultipletypeplatFailure,
  
  fetchtypeplatData,
  fetchtypeplatFailure,
  fetchtypeplatSuccess,

  updatetypeplatData,
  updatetypeplatDataFailure,
  updatetypeplatDataSuccess,

  fetchtypeplatNoPaginateData,
  fetchtypeplatNoPaginateSuccess,
  fetchtypeplatNoPaginateFailure
} from "./typeplat.action";

@Injectable()
export class TypeplatEffects {
    
    fetchlistData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchtypeplatData),
            mergeMap(({ page }) =>
                this.TypeplatService.getAllTypeplats(page || 1).pipe(
                    map((response) => {
                        console.log("Données chargées:", response);
                        return fetchtypeplatSuccess({ response });
                    }),
                    catchError((error) => {
                        console.error("Erreur lors du chargement des données:", error);
                        return of(fetchtypeplatFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    //Liste sans pagination
    fetchlistNoPaginData$ = createEffect(() =>
            this.actions$.pipe(
              ofType(fetchtypeplatNoPaginateData),
              mergeMap(() =>
                this.TypeplatService.getListTypeplats().pipe(
                  map((response) => fetchtypeplatNoPaginateSuccess({ response })),
                  catchError((error) => of(fetchtypeplatNoPaginateFailure({ error: error.toString() })))
                )
              )
            )
          );

    // Ajouter une typeplat
    addData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addtypeplatData),
            mergeMap(({ newData }) =>
                this.TypeplatService.createTypeplat(newData).pipe(
                    map((response) => addtypeplatDataSuccess({ newData: response })),
                    catchError((error) => {
                        console.error("Erreur lors de l'ajout:", error);
                        return of(addtypeplatDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après ajout
    addSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addtypeplatDataSuccess),
            map(() => fetchtypeplatData({ page: 1 }))  // Retour à la première page après ajout
        )
    );

    // Mettre à jour une typeplat
    updateData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updatetypeplatData),
            mergeMap(({ updatedData }) =>
                this.TypeplatService.updateTypeplat(updatedData).pipe(
                    map(() => updatetypeplatDataSuccess({ updatedData })),
                    catchError((error) => {
                        console.error("Erreur lors de la mise à jour:", error);
                        return of(updatetypeplatDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après mise à jour
    updateSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updatetypeplatDataSuccess),
            mergeMap(() => this.TypeplatService.getCurrentPageInfo().pipe(
                map(({ currentPage }) => {
                    console.log("Mise à jour réussie, rechargement de la page", currentPage);
                    // Utiliser explicitement le numéro de page actuel
                    return fetchtypeplatData({ page: currentPage });
                })
            ))
        )
    );

    // Supprimer un typeplat
    deleteData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletetypeplatData),
            mergeMap(({ id }) =>
                this.TypeplatService.deleteTypeplat(id).pipe(
                    map(() => deletetypeplatSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression:", error);
                        return of(deletetypeplatFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après suppression d'un typeplat
    deleteSingleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletetypeplatSuccess),
            mergeMap(() => this.TypeplatService.getCurrentPageInfo().pipe(
                map(({ currentPage, totalItems, itemsPerPage }) => {
                    console.log("Suppression réussie, vérification de la pagination");
                    
                    // Calculer le nombre total de pages après suppression
                    const totalPages = Math.ceil((totalItems - 1) / itemsPerPage);
                    
                    // Si currentPage > totalPages, revenir à la dernière page disponible
                    if (currentPage > totalPages) {
                        console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                        return fetchtypeplatData({ page: totalPages > 0 ? totalPages : 1 });
                    } else {
                        // Sinon, rester sur la page actuelle
                        console.log(`Maintien sur la page ${currentPage}`);
                        return fetchtypeplatData({ page: currentPage });
                    }
                }),
                catchError(error => {
                    console.error("Erreur lors de la vérification de pagination:", error);
                    // En cas d'erreur, charger la première page
                    return of(fetchtypeplatData({ page: 1 }));
                })
            ))
        )
    );

    // Supprimer plusieurs typeplat
    deleteMultipleData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultipletypeplatData),
            mergeMap(({ id }) => {
                // S'assurer que l'ID est bien formaté
                if (!id || id.trim() === '') {
                    console.error("Aucun ID valide pour la suppression multiple");
                    return of(deletemultipletypeplatFailure({ error: "Aucun ID valide" }));
                }
                
                const idArray = id.split(',')
                    .filter(idStr => idStr.trim() !== '')
                    .map(idStr => parseInt(idStr.trim()))
                    .filter(id => !isNaN(id));
                
                console.log("Suppression multiple des IDs:", idArray);
                
                if (idArray.length === 0) {
                    console.error("Aucun ID valide après conversion");
                    return of(deletemultipletypeplatFailure({ error: "Aucun ID valide après conversion" }));
                }
                
                return this.TypeplatService.deleteMultipleTypeplat(idArray).pipe(
                    map(() => deletemultipletypeplatSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression multiple:", error);
                        return of(deletemultipletypeplatFailure({ error: error.toString() }));
                    })
                );
            })
        )
    );

    // Récharger après suppression multiple
    deletemultipleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultipletypeplatSuccess),
            mergeMap(({ id }) => {
                const deletedCount = id.split(',').filter(i => i.trim() !== '').length;
                
                return this.TypeplatService.getCurrentPageInfo().pipe(
                    map(({ currentPage, totalItems, itemsPerPage }) => {
                        console.log("Suppression multiple réussie, vérification de la pagination");
                        console.log(`Items supprimés: ${deletedCount}, totalItems: ${totalItems}, page actuelle: ${currentPage}`);
                        
                        // Calculer le nombre total de pages après suppression multiple
                        const totalPages = Math.ceil((totalItems - deletedCount) / itemsPerPage);
                        
                        // Si currentPage > totalPages, revenir à la dernière page disponible
                        if (currentPage > totalPages) {
                            console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                            return fetchtypeplatData({ page: totalPages > 0 ? totalPages : 1 });
                        } else {
                            // Sinon, rester sur la page actuelle
                            console.log(`Maintien sur la page ${currentPage}`);
                            return fetchtypeplatData({ page: currentPage });
                        }
                    }),
                    catchError(error => {
                        console.error("Erreur lors de la vérification de pagination:", error);
                        // En cas d'erreur, charger la première page
                        return of(fetchtypeplatData({ page: 1 }));
                    })
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private CrudService: CrudService,
        private TypeplatService: TypeplatService
    ) { }
}