import { Injectable } from "@angular/core";
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CrudService } from "src/app/core/services/crud.service";
import { TypevehiculeService } from "src/app/core/services/typevehicule/typevehicule.service";
import { 
  addtypevehiculeData,
  addtypevehiculeDataFailure,
  addtypevehiculeDataSuccess,

  deletetypevehiculeData,
  deletetypevehiculeFailure,
  deletetypevehiculeSuccess,
  
  deletemultipletypevehiculeData,
  deletemultipletypevehiculeSuccess,
  deletemultipletypevehiculeFailure,
  
  fetchtypevehiculeData,
  fetchtypevehiculeFailure,
  fetchtypevehiculeSuccess,

  updatetypevehiculeData,
  updatetypevehiculeDataFailure,
  updatetypevehiculeDataSuccess,

  fetchtypevehiculeNoPaginateData,
  fetchtypevehiculeNoPaginateSuccess,
  fetchtypevehiculeNoPaginateFailure
} from "./typevehicule.action";

@Injectable()
export class TypevehiculeEffects {
    
    fetchlistData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchtypevehiculeData),
            mergeMap(({ page }) =>
                this.TypevehiculeService.getAllTypevehicules(page || 1).pipe(
                    map((response) => {
                        console.log("Données chargées:", response);
                        return fetchtypevehiculeSuccess({ response });
                    }),
                    catchError((error) => {
                        console.error("Erreur lors du chargement des données:", error);
                        return of(fetchtypevehiculeFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    //Liste sans pagination
    fetchlistNoPaginData$ = createEffect(() =>
            this.actions$.pipe(
              ofType(fetchtypevehiculeNoPaginateData),
              mergeMap(() =>
                this.TypevehiculeService.getListTypevehicules().pipe(
                  map((response) => fetchtypevehiculeNoPaginateSuccess({ response })),
                  catchError((error) => of(fetchtypevehiculeNoPaginateFailure({ error: error.toString() })))
                )
              )
            )
          );

    // Ajouter une typevehicule
    addData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addtypevehiculeData),
            mergeMap(({ newData }) =>
                this.TypevehiculeService.createTypevehicule(newData).pipe(
                    map((response) => addtypevehiculeDataSuccess({ newData: response })),
                    catchError((error) => {
                        console.error("Erreur lors de l'ajout:", error);
                        return of(addtypevehiculeDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après ajout
    addSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addtypevehiculeDataSuccess),
            map(() => fetchtypevehiculeData({ page: 1 }))  // Retour à la première page après ajout
        )
    );

    // Mettre à jour une typevehicule
    updateData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updatetypevehiculeData),
            mergeMap(({ updatedData }) =>
                this.TypevehiculeService.updateTypevehicule(updatedData).pipe(
                    map(() => updatetypevehiculeDataSuccess({ updatedData })),
                    catchError((error) => {
                        console.error("Erreur lors de la mise à jour:", error);
                        return of(updatetypevehiculeDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après mise à jour
    updateSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updatetypevehiculeDataSuccess),
            mergeMap(() => this.TypevehiculeService.getCurrentPageInfo().pipe(
                map(({ currentPage }) => {
                    console.log("Mise à jour réussie, rechargement de la page", currentPage);
                    // Utiliser explicitement le numéro de page actuel
                    return fetchtypevehiculeData({ page: currentPage });
                })
            ))
        )
    );

    // Supprimer un typevehicule
    deleteData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletetypevehiculeData),
            mergeMap(({ id }) =>
                this.TypevehiculeService.deleteTypevehicule(id).pipe(
                    map(() => deletetypevehiculeSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression:", error);
                        return of(deletetypevehiculeFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après suppression d'un typevehicule
    deleteSingleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletetypevehiculeSuccess),
            mergeMap(() => this.TypevehiculeService.getCurrentPageInfo().pipe(
                map(({ currentPage, totalItems, itemsPerPage }) => {
                    console.log("Suppression réussie, vérification de la pagination");
                    
                    // Calculer le nombre total de pages après suppression
                    const totalPages = Math.ceil((totalItems - 1) / itemsPerPage);
                    
                    // Si currentPage > totalPages, revenir à la dernière page disponible
                    if (currentPage > totalPages) {
                        console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                        return fetchtypevehiculeData({ page: totalPages > 0 ? totalPages : 1 });
                    } else {
                        // Sinon, rester sur la page actuelle
                        console.log(`Maintien sur la page ${currentPage}`);
                        return fetchtypevehiculeData({ page: currentPage });
                    }
                }),
                catchError(error => {
                    console.error("Erreur lors de la vérification de pagination:", error);
                    // En cas d'erreur, charger la première page
                    return of(fetchtypevehiculeData({ page: 1 }));
                })
            ))
        )
    );

    // Supprimer plusieurs typevehicule
    deleteMultipleData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultipletypevehiculeData),
            mergeMap(({ id }) => {
                // S'assurer que l'ID est bien formaté
                if (!id || id.trim() === '') {
                    console.error("Aucun ID valide pour la suppression multiple");
                    return of(deletemultipletypevehiculeFailure({ error: "Aucun ID valide" }));
                }
                
                const idArray = id.split(',')
                    .filter(idStr => idStr.trim() !== '')
                    .map(idStr => parseInt(idStr.trim()))
                    .filter(id => !isNaN(id));
                
                console.log("Suppression multiple des IDs:", idArray);
                
                if (idArray.length === 0) {
                    console.error("Aucun ID valide après conversion");
                    return of(deletemultipletypevehiculeFailure({ error: "Aucun ID valide après conversion" }));
                }
                
                return this.TypevehiculeService.deleteMultipleTypevehicule(idArray).pipe(
                    map(() => deletemultipletypevehiculeSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression multiple:", error);
                        return of(deletemultipletypevehiculeFailure({ error: error.toString() }));
                    })
                );
            })
        )
    );

    // Récharger après suppression multiple
    deletemultipleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultipletypevehiculeSuccess),
            mergeMap(({ id }) => {
                const deletedCount = id.split(',').filter(i => i.trim() !== '').length;
                
                return this.TypevehiculeService.getCurrentPageInfo().pipe(
                    map(({ currentPage, totalItems, itemsPerPage }) => {
                        console.log("Suppression multiple réussie, vérification de la pagination");
                        console.log(`Items supprimés: ${deletedCount}, totalItems: ${totalItems}, page actuelle: ${currentPage}`);
                        
                        // Calculer le nombre total de pages après suppression multiple
                        const totalPages = Math.ceil((totalItems - deletedCount) / itemsPerPage);
                        
                        // Si currentPage > totalPages, revenir à la dernière page disponible
                        if (currentPage > totalPages) {
                            console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                            return fetchtypevehiculeData({ page: totalPages > 0 ? totalPages : 1 });
                        } else {
                            // Sinon, rester sur la page actuelle
                            console.log(`Maintien sur la page ${currentPage}`);
                            return fetchtypevehiculeData({ page: currentPage });
                        }
                    }),
                    catchError(error => {
                        console.error("Erreur lors de la vérification de pagination:", error);
                        // En cas d'erreur, charger la première page
                        return of(fetchtypevehiculeData({ page: 1 }));
                    })
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private CrudService: CrudService,
        private TypevehiculeService: TypevehiculeService
    ) { }
}