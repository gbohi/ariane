import { Injectable } from "@angular/core";
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CrudService } from "src/app/core/services/crud.service";
import { VehiculeService } from "src/app/core/services/vehicule/vehicule.service";
import { 
  addvehiculeData,
  addvehiculeDataFailure,
  addvehiculeDataSuccess,

  deletevehiculeData,
  deletevehiculeFailure,
  deletevehiculeSuccess,
  
  deletemultiplevehiculeData,
  deletemultiplevehiculeSuccess,
  deletemultiplevehiculeFailure,
  
  fetchvehiculeData,
  fetchvehiculeFailure,
  fetchvehiculeSuccess,

  updatevehiculeData,
  updatevehiculeDataFailure,
  updatevehiculeDataSuccess,

  fetchvehiculeNoPaginateData,
  fetchvehiculeNoPaginateSuccess,
  fetchvehiculeNoPaginateFailure
} from "./vehicule.action";

@Injectable()
export class VehiculeEffects {
    
    fetchlistData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchvehiculeData),
            mergeMap(({ page }) =>
                this.VehiculeService.getAllVehicules(page || 1).pipe(
                    map((response) => {
                        console.log("Données chargées:", response);
                        return fetchvehiculeSuccess({ response });
                    }),
                    catchError((error) => {
                        console.error("Erreur lors du chargement des données:", error);
                        return of(fetchvehiculeFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    //Liste sans pagination
    fetchlistNoPaginData$ = createEffect(() =>
            this.actions$.pipe(
              ofType(fetchvehiculeNoPaginateData),
              mergeMap(() =>
                this.VehiculeService.getListVehicules().pipe(
                  map((response) => fetchvehiculeNoPaginateSuccess({ response })),
                  catchError((error) => of(fetchvehiculeNoPaginateFailure({ error: error.toString() })))
                )
              )
            )
          );

    // Ajouter un vehicule
    addData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addvehiculeData),
            mergeMap(({ newData }) =>
                this.VehiculeService.createVehicule(newData).pipe(
                    map((response) => addvehiculeDataSuccess({ newData: response })),
                    catchError((error) => {
                        console.error("Erreur lors de l'ajout:", error);
                        return of(addvehiculeDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après ajout
    addSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addvehiculeDataSuccess),
            map(() => fetchvehiculeData({ page: 1 }))  // Retour à la première page après ajout
        )
    );

    // Mettre à jour un vehicule
    updateData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updatevehiculeData),
            mergeMap(({ updatedData }) =>
                this.VehiculeService.updateVehicule(updatedData).pipe(
                    map(() => updatevehiculeDataSuccess({ updatedData })),
                    catchError((error) => {
                        console.error("Erreur lors de la mise à jour:", error);
                        return of(updatevehiculeDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après mise à jour
    updateSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updatevehiculeDataSuccess),
            mergeMap(() => this.VehiculeService.getCurrentPageInfo().pipe(
                map(({ currentPage }) => {
                    console.log("Mise à jour réussie, rechargement de la page", currentPage);
                    // Utiliser explicitement le numéro de page actuel
                    return fetchvehiculeData({ page: currentPage });
                })
            ))
        )
    );

    // Supprimer un vehicule
    deleteData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletevehiculeData),
            mergeMap(({ id }) =>
                this.VehiculeService.deleteVehicule(id).pipe(
                    map(() => deletevehiculeSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression:", error);
                        return of(deletevehiculeFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après suppression d'un vehicule
    deleteSingleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletevehiculeSuccess),
            mergeMap(() => this.VehiculeService.getCurrentPageInfo().pipe(
                map(({ currentPage, totalItems, itemsPerPage }) => {
                    console.log("Suppression réussie, vérification de la pagination");
                    
                    // Calculer le nombre total de pages après suppression
                    const totalPages = Math.ceil((totalItems - 1) / itemsPerPage);
                    
                    // Si currentPage > totalPages, revenir à la dernière page disponible
                    if (currentPage > totalPages) {
                        console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                        return fetchvehiculeData({ page: totalPages > 0 ? totalPages : 1 });
                    } else {
                        // Sinon, rester sur la page actuelle
                        console.log(`Maintien sur la page ${currentPage}`);
                        return fetchvehiculeData({ page: currentPage });
                    }
                }),
                catchError(error => {
                    console.error("Erreur lors de la vérification de pagination:", error);
                    // En cas d'erreur, charger la première page
                    return of(fetchvehiculeData({ page: 1 }));
                })
            ))
        )
    );

    // Supprimer plusieurs vehicule
    deleteMultipleData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultiplevehiculeData),
            mergeMap(({ id }) => {
                // S'assurer que l'ID est bien formaté
                if (!id || id.trim() === '') {
                    console.error("Aucun ID valide pour la suppression multiple");
                    return of(deletemultiplevehiculeFailure({ error: "Aucun ID valide" }));
                }
                
                const idArray = id.split(',')
                    .filter(idStr => idStr.trim() !== '')
                    .map(idStr => parseInt(idStr.trim()))
                    .filter(id => !isNaN(id));
                
                console.log("Suppression multiple des IDs:", idArray);
                
                if (idArray.length === 0) {
                    console.error("Aucun ID valide après conversion");
                    return of(deletemultiplevehiculeFailure({ error: "Aucun ID valide après conversion" }));
                }
                
                return this.VehiculeService.deleteMultipleVehicule(idArray).pipe(
                    map(() => deletemultiplevehiculeSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression multiple:", error);
                        return of(deletemultiplevehiculeFailure({ error: error.toString() }));
                    })
                );
            })
        )
    );

    // Récharger après suppression multiple
    deletemultipleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultiplevehiculeSuccess),
            mergeMap(({ id }) => {
                const deletedCount = id.split(',').filter(i => i.trim() !== '').length;
                
                return this.VehiculeService.getCurrentPageInfo().pipe(
                    map(({ currentPage, totalItems, itemsPerPage }) => {
                        console.log("Suppression multiple réussie, vérification de la pagination");
                        console.log(`Items supprimés: ${deletedCount}, totalItems: ${totalItems}, page actuelle: ${currentPage}`);
                        
                        // Calculer le nombre total de pages après suppression multiple
                        const totalPages = Math.ceil((totalItems - deletedCount) / itemsPerPage);
                        
                        // Si currentPage > totalPages, revenir à la dernière page disponible
                        if (currentPage > totalPages) {
                            console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                            return fetchvehiculeData({ page: totalPages > 0 ? totalPages : 1 });
                        } else {
                            // Sinon, rester sur la page actuelle
                            console.log(`Maintien sur la page ${currentPage}`);
                            return fetchvehiculeData({ page: currentPage });
                        }
                    }),
                    catchError(error => {
                        console.error("Erreur lors de la vérification de pagination:", error);
                        // En cas d'erreur, charger la première page
                        return of(fetchvehiculeData({ page: 1 }));
                    })
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private CrudService: CrudService,
        private VehiculeService: VehiculeService
    ) { }
}