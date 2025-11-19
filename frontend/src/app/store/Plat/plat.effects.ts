import { Injectable } from "@angular/core";
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CrudService } from "src/app/core/services/crud.service";
import { PlatService } from "src/app/core/services/plat/plat.service";
import { 
  addplatData,
  addplatDataFailure,
  addplatDataSuccess,

  addNoAuthplatData,
  addNoAuthplatDataFailure,
  addNoAuthplatDataSuccess,

  deleteplatData,
  deleteplatFailure,
  deleteplatSuccess,
  
  deletemultipleplatData,
  deletemultipleplatSuccess,
  deletemultipleplatFailure,
  
  fetchplatData,
  fetchplatFailure,
  fetchplatSuccess,

  updateplatData,
  updateplatDataFailure,
  updateplatDataSuccess,

  fetchstatistiqueplatData,
  fetchstatistiqueplatSuccess,
  fetchstatistiqueplatFailure,

  createPlatWithFiles,
  createPlatWithFilesSuccess,
  createPlatWithFilesFailure,

  updatePlatWithFiles,
  updatePlatWithFilesSuccess,
  updatePlatWithFilesFailure
} from "./plat.action";

@Injectable()
export class PlatEffects {
    
    fetchlistData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchplatData),
            mergeMap(({ page }) =>
                this.PlatService.getAllPlats(page || 1).pipe(
                    map((response) => {
                        console.log("Données chargées:", response);
                        return fetchplatSuccess({ response });
                    }),
                    catchError((error) => {
                        console.error("Erreur lors du chargement des données:", error);
                        return of(fetchplatFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Ajouter une plat
    addData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addplatData),
            mergeMap(({ newData }) =>
                this.PlatService.createPlat(newData).pipe(
                    map((response) => addplatDataSuccess({ newData: response })),
                    catchError((error) => {
                        console.error("Erreur lors de l'ajout:", error);
                        return of(addplatDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // plat.effects.ts
    // ⬇️ Créer un plat avec fichiers (FormData)
createPlatWithFiles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createPlatWithFiles),
      mergeMap(({ newData }) =>
        this.PlatService.createPlatWithFiles(newData).pipe(
          map(response => createPlatWithFilesSuccess({ plat: response })),
          catchError(error => {
            console.error('Erreur lors de l’envoi :', error);
            return of(createPlatWithFilesFailure({ error: error?.message || 'Erreur inconnue' }));
          })
        )
      )
    )
  );
  
  // ⬇️ Recharger la liste après ajout réussi
  createPlatWithFilesSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createPlatWithFilesSuccess),
      mergeMap(() =>
        this.PlatService.getCurrentPageInfo().pipe(
          map(({ currentPage }) => {
            return fetchplatData({ page: currentPage || 1 });
          }),
          catchError(() => of(fetchplatData({ page: 1 })))
        )
      )
    )
  );


  // Update with File
  updatePlatWithFiles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePlatWithFiles),
      mergeMap(({ id, updatedData }) =>
        this.PlatService.updatePlatWithFiles(id, updatedData).pipe(
          map(response => updatePlatWithFilesSuccess({ updatedPlat: response })),
          catchError(error =>
            of(updatePlatWithFilesFailure({ error: error?.message || 'Erreur inconnue' }))
          )
        )
      )
    )
  );
  
  // ⏩ rechargement après update
  updatePlatWithFilesSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePlatWithFilesSuccess),
      mergeMap(() =>
        this.PlatService.getCurrentPageInfo().pipe(
          map(({ currentPage }) => fetchplatData({ page: currentPage })),
          catchError(() => of(fetchplatData({ page: 1 })))
        )
      )
    )
  );
  
  

    // Ajouter un sans authentification plat
    /*addNoAuthData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addNoAuthplatData),
            mergeMap(({ newData }) =>
                this.PlatService.createNoAuthPlat(newData).pipe(
                    map((response) => addNoAuthplatDataSuccess({ newData: response })),
                    catchError((error) => {
                        console.error("Erreur lors de l'ajout:", error);
                        return of(addNoAuthplatDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );*/

    /*addNoAuthData$ = createEffect(() =>
        this.actions$.pipe(
          ofType(addNoAuthplatData),
          mergeMap(({ newData }) =>
            this.PlatService.createNoAuthPlat(newData as FormData).pipe(   // 👈 ici cast en FormData
              map((response) => addNoAuthplatDataSuccess({ newData: response })),
              catchError((error) => {
                console.error('Erreur lors de l\'ajout:', error);
                return of(addNoAuthplatDataFailure({ error: error.toString() }));
              })
            )
          )
        )
      );*/
      
      fetchStatistiqueGlobale$ = createEffect(() =>
        this.actions$.pipe(
          ofType(fetchstatistiqueplatData),
          mergeMap(() =>
            this.PlatService.getStatistiquesGlobales().pipe(
              map((response) => fetchstatistiqueplatSuccess({ response })),
              catchError((error) =>
                of(fetchstatistiqueplatFailure({ error: error.message }))
              )
            )
          )
        )
      );
        
      

    // Récharger après ajout
    addSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addplatDataSuccess),
            map(() => fetchplatData({ page: 1 }))  // Retour à la première page après ajout
        )
    );

    // Mettre à jour une plat
    updateData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateplatData),
            mergeMap(({ updatedData }) =>
                this.PlatService.updatePlat(updatedData).pipe(
                    map(() => updateplatDataSuccess({ updatedData })),
                    catchError((error) => {
                        console.error("Erreur lors de la mise à jour:", error);
                        return of(updateplatDataFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après mise à jour
    updateSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateplatDataSuccess),
            mergeMap(() => this.PlatService.getCurrentPageInfo().pipe(
                map(({ currentPage }) => {
                    console.log("Mise à jour réussie, rechargement de la page", currentPage);
                    // Utiliser explicitement le numéro de page actuel
                    return fetchplatData({ page: currentPage });
                })
            ))
        )
    );

    
      

    // Supprimer un plat
    deleteData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteplatData),
            mergeMap(({ id }) =>
                this.PlatService.deletePlat(id).pipe(
                    map(() => deleteplatSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression:", error);
                        return of(deleteplatFailure({ error: error.toString() }));
                    })
                )
            )
        )
    );

    // Récharger après suppression d'un plat
    deleteSingleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteplatSuccess),
            mergeMap(() => this.PlatService.getCurrentPageInfo().pipe(
                map(({ currentPage, totalItems, itemsPerPage }) => {
                    console.log("Suppression réussie, vérification de la pagination");
                    
                    // Calculer le nombre total de pages après suppression
                    const totalPages = Math.ceil((totalItems - 1) / itemsPerPage);
                    
                    // Si currentPage > totalPages, revenir à la dernière page disponible
                    if (currentPage > totalPages) {
                        console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                        return fetchplatData({ page: totalPages > 0 ? totalPages : 1 });
                    } else {
                        // Sinon, rester sur la page actuelle
                        console.log(`Maintien sur la page ${currentPage}`);
                        return fetchplatData({ page: currentPage });
                    }
                }),
                catchError(error => {
                    console.error("Erreur lors de la vérification de pagination:", error);
                    // En cas d'erreur, charger la première page
                    return of(fetchplatData({ page: 1 }));
                })
            ))
        )
    );

    // Supprimer plusieurs plat
    deleteMultipleData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultipleplatData),
            mergeMap(({ id }) => {
                // S'assurer que l'ID est bien formaté
                if (!id || id.trim() === '') {
                    console.error("Aucun ID valide pour la suppression multiple");
                    return of(deletemultipleplatFailure({ error: "Aucun ID valide" }));
                }
                
                const idArray = id.split(',')
                    .filter(idStr => idStr.trim() !== '')
                    .map(idStr => parseInt(idStr.trim()))
                    .filter(id => !isNaN(id));
                
                console.log("Suppression multiple des IDs:", idArray);
                
                if (idArray.length === 0) {
                    console.error("Aucun ID valide après conversion");
                    return of(deletemultipleplatFailure({ error: "Aucun ID valide après conversion" }));
                }
                
                return this.PlatService.deleteMultiplePlat(idArray).pipe(
                    map(() => deletemultipleplatSuccess({ id })),
                    catchError((error) => {
                        console.error("Erreur lors de la suppression multiple:", error);
                        return of(deletemultipleplatFailure({ error: error.toString() }));
                    })
                );
            })
        )
    );

    // Récharger après suppression multiple
    deletemultipleSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deletemultipleplatSuccess),
            mergeMap(({ id }) => {
                const deletedCount = id.split(',').filter(i => i.trim() !== '').length;
                
                return this.PlatService.getCurrentPageInfo().pipe(
                    map(({ currentPage, totalItems, itemsPerPage }) => {
                        console.log("Suppression multiple réussie, vérification de la pagination");
                        console.log(`Items supprimés: ${deletedCount}, totalItems: ${totalItems}, page actuelle: ${currentPage}`);
                        
                        // Calculer le nombre total de pages après suppression multiple
                        const totalPages = Math.ceil((totalItems - deletedCount) / itemsPerPage);
                        
                        // Si currentPage > totalPages, revenir à la dernière page disponible
                        if (currentPage > totalPages) {
                            console.log(`Redirection vers la page ${totalPages} (dernière page disponible)`);
                            return fetchplatData({ page: totalPages > 0 ? totalPages : 1 });
                        } else {
                            // Sinon, rester sur la page actuelle
                            console.log(`Maintien sur la page ${currentPage}`);
                            return fetchplatData({ page: currentPage });
                        }
                    }),
                    catchError(error => {
                        console.error("Erreur lors de la vérification de pagination:", error);
                        // En cas d'erreur, charger la première page
                        return of(fetchplatData({ page: 1 }));
                    })
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private CrudService: CrudService,
        private PlatService: PlatService
    ) { }
}