import { Injectable } from "@angular/core";
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CrudService } from "src/app/core/services/crud.service";
import { RoleService } from "src/app/core/services/role/role.service"; 
import { 
  addroleData,
  addroleDataFailure,
  addroleDataSuccess,

  deleteroleData,
  deleteroleFailure,
  deleteroleSuccess,
  
  deletemultipleroleData,
  deletemultipleroleSuccess,
  deletemultipleroleFailure,
  
  fetchroleData,
  fetchroleFailure,
  fetchroleSuccess,

  updateroleData,
  updateroleDataFailure,
  updateroleDataSuccess
} from "./role.action";

@Injectable()
export class RoleEffects {
    
    fetchlistData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchroleData),
            mergeMap(({ page }) =>
                this.RoleService.getAllRoles(page || 1).pipe(
                    map((response) => {
                        console.log("Données chargées:", response);
                        return fetchroleSuccess({ response });
                    }),
                    catchError((error) => {
                        console.error("Erreur lors du chargement des données:", error);
                        return of(fetchroleFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Ajouter une priorité
    addData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addroleData),
            mergeMap(({ newData }) =>
                this.RoleService.createRole(newData).pipe(
                    map((response) => addroleDataSuccess({ newData: response })),
                    catchError((error) => {
                        console.error("Erreur lors de l'ajout:", error);
                        return of(addroleDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après ajout
    addSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addroleDataSuccess),
            map(() => fetchroleData({ page: 1 }))  // Retour à la première page après ajout
        )
    );

    // Mettre à jour une priorité
    updateData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateroleData),
            mergeMap(({ updatedData }) =>
                this.RoleService.updateRole(updatedData).pipe(
                    map(() => updateroleDataSuccess({ updatedData })),
                    catchError((error) => {
                        console.error("Erreur lors de la mise à jour:", error);
                        return of(updateroleDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après mise à jour
    updateSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateroleDataSuccess),
            mergeMap(() => this.RoleService.getCurrentPageInfo().pipe(
                map(({ currentPage }) => {
                    console.log("Mise à jour réussie, rechargement de la page", currentPage);
                    // Utiliser explicitement le numéro de page actuel
                    return fetchroleData({ page: currentPage });
                })
            ))
        )
    );

    // Supprimer une priorité
    deleteData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteroleData),
            mergeMap(({ id }) =>
                this.RoleService.deleteRole(id).pipe(
                    map(() => deleteroleSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression:", error);
                        return of(deleteroleFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après suppression d'une priorité
    deleteSingleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteroleSuccess),
            mergeMap(() => this.RoleService.getCurrentPageInfo().pipe(
                map(({ currentPage, totalItems, itemsPerPage }) => {
                    console.log("Suppression réussie, vérification de la pagination");
                    
                    // Calculer le nombre total de pages après suppression
                    const totalPages = Math.ceil((totalItems - 1) / itemsPerPage);
                    
                    // Si currentPage > totalPages, revenir à la dernière page disponible
                    if (currentPage > totalPages) {
                        console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                        return fetchroleData({ page: totalPages > 0 ? totalPages : 1 });
                    } else {
                        // Sinon, rester sur la page actuelle
                        console.log(`Maintien sur la page ${currentPage}`);
                        return fetchroleData({ page: currentPage });
                    }
                }),
                catchError(error => {
                    console.error("Erreur lors de la vérification de pagination:", error);
                    // En cas d'erreur, charger la première page
                    return of(fetchroleData({ page: 1 }));
                })
            ))
        )
    );

    // Supprimer plusieurs priorités
    deleteMultipleData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultipleroleData),
            mergeMap(({ id }) => {
                // S'assurer que l'ID est bien formaté
                if (!id || id.trim() === '') {
                    console.error("Aucun ID valide pour la suppression multiple");
                    return of(deletemultipleroleFailure({ error: "Aucun ID valide" }));
                }
                
                const idArray = id.split(',')
                    .filter(idStr => idStr.trim() !== '')
                    .map(idStr => parseInt(idStr.trim()))
                    .filter(id => !isNaN(id));
                
                console.log("Suppression multiple des IDs:", idArray);
                
                if (idArray.length === 0) {
                    console.error("Aucun ID valide après conversion");
                    return of(deletemultipleroleFailure({ error: "Aucun ID valide après conversion" }));
                }
                
                return this.RoleService.deleteMultipleRole(idArray).pipe(
                    map(() => deletemultipleroleSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression multiple:", error);
                        return of(deletemultipleroleFailure({ error: error.toString() }));
                    })
                );
            })
        )
    );

    // Récharger après suppression multiple
    deletemultipleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultipleroleSuccess),
            mergeMap(({ id }) => {
                const deletedCount = id.split(',').filter(i => i.trim() !== '').length;
                
                return this.RoleService.getCurrentPageInfo().pipe(
                    map(({ currentPage, totalItems, itemsPerPage }) => {
                        console.log("Suppression multiple réussie, vérification de la pagination");
                        console.log(`Items supprimés: ${deletedCount}, totalItems: ${totalItems}, page actuelle: ${currentPage}`);
                        
                        // Calculer le nombre total de pages après suppression multiple
                        const totalPages = Math.ceil((totalItems - deletedCount) / itemsPerPage);
                        
                        // Si currentPage > totalPages, revenir à la dernière page disponible
                        if (currentPage > totalPages) {
                            console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                            return fetchroleData({ page: totalPages > 0 ? totalPages : 1 });
                        } else {
                            // Sinon, rester sur la page actuelle
                            console.log(`Maintien sur la page ${currentPage}`);
                            return fetchroleData({ page: currentPage });
                        }
                    }),
                    catchError(error => {
                        console.error("Erreur lors de la vérification de pagination:", error);
                        // En cas d'erreur, charger la première page
                        return of(fetchroleData({ page: 1 }));
                    })
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private CrudService: CrudService,
        private RoleService: RoleService
    ) { }
}