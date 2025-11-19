import { Component, QueryList, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Observable, take } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
// Date Format
import { DatePipe } from '@angular/common';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { Store } from '@ngrx/store';
import { addplatData, deleteplatData, deletemultipleplatData, fetchplatData, updateplatData, updateplatDataSuccess,updateplatDataFailure, addplatDataSuccess, addplatDataFailure, fetchstatistiqueplatData, createPlatWithFiles, createPlatWithFilesSuccess, createPlatWithFilesFailure, updatePlatWithFiles, updatePlatWithFilesSuccess, updatePlatWithFilesFailure  } from 'src/app/store/Plat/plat.action';
import { selectplatData, selectTotalItems, selectLoading, selectCurrentPage, selectStatistiqueGlobale, selectStatistiqueLoading  } from 'src/app/store/Plat/plat-selector';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { cloneDeep } from 'lodash';

import { selectAllTypeplatWithoutPagination } from 'src/app/store/Typeplat/typeplat-selector';
import { fetchtypeplatNoPaginateData } from 'src/app/store/Typeplat/typeplat.action';

import { selectAllAgenceWithoutPagination} from 'src/app/store/Agence/agence-selector';
import { fetchagenceNoPaginateData } from 'src/app/store/Agence/agence.action';


import { fetchuserData } from 'src/app/store/User/user.action';
import { selectuserData} from 'src/app/store/User/user-selector';

import { Actions, ofType } from '@ngrx/effects';


@Component({
  selector: 'app-liste-plats',
  templateUrl: './liste-plats.component.html',
  styleUrl: './liste-plats.component.scss',
  providers: [DecimalPipe]
})

// list Component
export class ListePlatsComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  plats: any[] = [];
  platList: any[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  isLoading: boolean = true;

  platForm!: UntypedFormGroup;
  submitted = false;
  masterSelected!: boolean;
  term: any;
  files: File[] = [];
  checkedValGet: any[] = [];

  agences: any[] = [];
  typeplats: any[] = [];

  uploadedFilesNouvelles: File[] = [];  // Nouvelles images via Dropzone
  imagesExistantes: any[] = [];         // Images déjà en base
  imagesASupprimerIds: number[] = [];   // IDs à supprimer

  users: any[] = [];
  statistiques: {
    par_etat: { etat: string; nombre: number }[];
    par_priorite: { priorite: string; nombre: number }[];
    total_non_cloture: number;
    total_besoin: number;
  } | null = null;

  // Référence pour stocker l'élément qui avait le focus avant l'ouverture de la modal
  private lastActiveElement: HTMLElement | null = null;
  
  @ViewChild('addPlat', { static: false }) addPlat?: ModalDirective;
  @ViewChild('deleteRecordModal', { static: false }) deleteRecordModal?: ModalDirective;
  @ViewChild('mainContainer', { static: false }) mainContainer?: ElementRef;
  @ViewChild('viewPlat', { static: false }) viewPlat?: ModalDirective;
  selectedPlat: any = null;
  deleteID: any;
  direction: any = 'asc';

  constructor(
    private formBuilder: UntypedFormBuilder, 
    private datePipe: DatePipe, 
    public toastService: ToastrService, 
    public store: Store,
    private actions$: Actions,
  ) {}

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Plat', active: true },
      { label: 'Plat List', active: true }
    ];

    /**
     * Form Validation
     */
    this.platForm = this.formBuilder.group({
      id: [''],
      nom: ['', [Validators.required]],
      description: ['', [Validators.required]],
      type_plat: ['', [Validators.required]],
      agence: ['', [Validators.required]]
    });

    // S'abonner à l'état de chargement
    this.store.select(selectLoading).subscribe(loading => {
      this.isLoading = loading;
      if (!loading) {
        document.getElementById('elmLoader')?.classList.add('d-none');
      } else {
        document.getElementById('elmLoader')?.classList.remove('d-none');
      }
    });

    // S'abonner au nombre total d'éléments
    this.store.select(selectTotalItems).subscribe(total => {
      this.totalItems = total || 0;
    });

    // S'abonner à la page actuelle
    this.store.select(selectCurrentPage).subscribe(page => {
      this.currentPage = page || 1;
    });

    // S'abonner aux données
    this.store.select(selectplatData).subscribe(data => {
      if (data) {
        // Initialiser correctement les états
        this.plats = data.map(item => ({
          ...item,
          state: false
        }));
        this.platList = [...this.plats];
        this.updateNoResultDisplay();
      }
    });

    // S'abonner aux données users
    this.store.select(selectuserData).subscribe(data => {
      if (data) {
        // Initialiser correctement les users
        this.users = data.map(item => ({
          ...item,
          state: false
        }));
      }
    });


    // S'abonner aux données statistique

    this.store.select(selectStatistiqueGlobale).subscribe(data => {
      if (data) {
        this.statistiques = data;
        console.log(this.statistiques)
      }
    });

    // S'abonner aux données agences
        this.store.select(selectAllAgenceWithoutPagination).subscribe(data => {
          if (data) {
            // Initialiser correctement les états
            this.agences = data.map(item => ({
              ...item,
              state: false
            }));
            console.log(data)
          }
        });
    
        // S'abonner aux données type plat
        this.store.select(selectAllTypeplatWithoutPagination).subscribe(data => {
          if (data) {
            // Initialiser correctement les états
            this.typeplats = data.map(item => ({
              ...item,
              state: false
            }));
          }
        });

    // Charger les données initiales
    this.loadData(1);
  }

  ngAfterViewInit() {
    // Configuration de l'événement onHidden pour les modals
    if (this.addPlat) {
      this.addPlat.onHidden.subscribe(() => {
        // Réinitialiser le formulaire si nécessaire après fermeture
        this.platForm.reset();
        
        // Réinitialiser le texte du bouton et du titre
        const modaltitle = document.querySelector('.modal-title') as HTMLAreaElement;
        if (modaltitle) modaltitle.innerHTML = 'Ajouter un plat';
        
        const modalbtn = document.getElementById('add-btn') as HTMLAreaElement;
        if (modalbtn) modalbtn.innerHTML = 'Ajouter';
      });
    }
    
    if (this.deleteRecordModal) {
      this.deleteRecordModal.onHidden.subscribe(() => {
        // Nettoyer l'état après fermeture si nécessaire
        this.deleteID = null;
      });
    }
  }

  getEtatStyle(etat: string): { icon: string, textClass: string, borderClass: string } {
    switch (etat.toLowerCase()) {
      case 'clôturé':
      case 'cloturé':
      case 'clôturés':
        return {
          icon: 'bi-patch-check-fill',
          textClass: 'text-success',
          borderClass: 'border border-success-subtle'
        };
      case 'En attente':
        return {
          icon: 'bi-file-earmark-text',
          textClass: 'text-primary',
          borderClass: 'border border-primary-subtle'
        };
      case 'en cours':
        return {
          icon: 'bi-clock-history',
          textClass: 'text-warning',
          borderClass: 'border border-warning-subtle'
        };
      case 'annulé':
      case 'annulés':
        return {
          icon: 'bi-x-circle',
          textClass: 'text-danger',
          borderClass: 'border border-danger-subtle'
        };
      default:
        return {
          icon: 'bi-question-circle',
          textClass: 'text-secondary',
          borderClass: 'border border-secondary-subtle'
        };
    }
  }

  getPourcentageNonCloture(): number {
    if (!this.statistiques) return 0;
  
    const total = this.statistiques.total_besoin;
    if (total === 0) return 0;
  
    return Math.round((this.statistiques.total_non_cloture / total) * 100);
  }
  
  // 🌟 Ajoute dans ListBesoinComponent.ts

// 1. Base URL pour construire les liens vers les fichiers
baseUrl: string = 'http://localhost:8000'; // ✅ adapte ici si tu changes ton backend en prod

// 2. Fonction pour vérifier si c'est une image
isImage(documentPath: string): boolean {
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
  return extensions.some(ext => documentPath.toLowerCase().endsWith(ext));
}

// 3. Fonction pour construire l'URL complète
getFullUrl(documentPath: string): string {
  return this.baseUrl + documentPath;
}

// 4. (Optionnel mais utile) Fonction pour extraire juste le nom du fichier
getFileName(documentPath: string): string {
  return documentPath.split('/').pop() || 'Document';
}


  // Charger les données avec pagination
  loadData(page: number = 1): void {
    this.store.dispatch(fetchplatData({ page }));

    //pour le user, ne pas faire de pagination
    this.store.dispatch(fetchuserData({ page }));
    this.store.dispatch(fetchstatistiqueplatData());


    this.store.dispatch(fetchagenceNoPaginateData());
    this.store.dispatch(fetchtypeplatNoPaginateData());
  }

  

  // Méthodes existantes
  // File Upload 
  public dropzoneConfig: DropzoneConfigInterface = {
    clickable: true,
    addRemoveLinks: true,
    previewsContainer: false,
  };

  uploadedFiles: any[] = [];

  // File Upload
  imageURL: any;
  onUploadSuccess(event: any) {
    setTimeout(() => {
      this.uploadedFiles.push(event[0]);
      this.imageURL = event[0].dataURL;
    }, 0);
  }

  // File Remove
  removeFile(event: any) {
    this.uploadedFiles.splice(this.uploadedFiles.indexOf(event), 1);
  }

  // Ouverture de la modal d'ajout
  openAddModal() {
    // Stocker l'élément actif avant d'ouvrir la modal
    this.lastActiveElement = document.activeElement as HTMLElement;
    this.addPlat?.show();
    const modaltitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modaltitle.innerHTML = 'Ajouter un plat';
    const modalbtn = document.getElementById('add-btn') as HTMLAreaElement;
    modalbtn.innerHTML = 'Ajouter';
    
    // Réinitialiser le formulaire
    this.platForm.reset();
  }

  // Fermeture de la modal d'ajout
  /*closeAddModal() {
    this.addPlat?.hide();
    
    // Réinitialiser le texte du bouton et du titre pour la prochaine utilisation
    const modaltitle = document.querySelector('.modal-title') as HTMLAreaElement;
    if (modaltitle) modaltitle.innerHTML = 'Ajouter une plat';
    
    const modalbtn = document.getElementById('add-btn') as HTMLAreaElement;
    if (modalbtn) modalbtn.innerHTML = 'Ajouter';
    
    // Rediriger le focus vers l'élément précédemment actif
    setTimeout(() => {
      if (this.lastActiveElement) {
        this.lastActiveElement.focus();
      }
    }, 100);
    this.platForm.reset();
  }*/

  closeAddModal() {
    // D'abord déplacer le focus hors de la modal avant de la fermer
    if (this.lastActiveElement) {
      this.lastActiveElement.focus();
    } else {
      // Fallback si lastActiveElement n'est pas défini
      document.body.focus();
    }
    
    // Petite pause pour s'assurer que le focus est bien déplacé
    setTimeout(() => {
      this.addPlat?.hide();
      
      // Réinitialiser le texte du bouton et du titre
      const modaltitle = document.querySelector('.modal-title') as HTMLAreaElement;
      if (modaltitle) modaltitle.innerHTML = 'Ajouter un plat';
      
      const modalbtn = document.getElementById('add-btn') as HTMLAreaElement;
      if (modalbtn) modalbtn.innerHTML = 'Ajouter';
    }, 10);
  }

  // Edit Data
  editList(id: any) {
    this.lastActiveElement = document.activeElement as HTMLElement;
    this.addPlat?.show();
  
    const modaltitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modaltitle.innerHTML = "Modifier le plat";
    const modalbtn = document.getElementById('add-btn') as HTMLAreaElement;
    modalbtn.innerHTML = 'Mettre à jour';
  
    const editData = typeof id === 'number' ? this.plats[id] : this.plats.find(p => p.id === id);
    
    if (editData) {
      this.platForm.patchValue(editData);
      this.uploadedFilesNouvelles = [];       // Vider Dropzone
      this.imagesExistantes = editData.images || []; // Remplir les anciennes images
      this.imagesASupprimerIds = [];          // Vider les suppressions
    }
  }
  
  onImageDeleteCheckboxChange(id: number, event: any) {
    if (event.target.checked) {
      this.imagesASupprimerIds.push(id);
    } else {
      this.imagesASupprimerIds = this.imagesASupprimerIds.filter(val => val !== id);
    }
  }
  
  // Add/Update Property
  /*saveProperty() {
    if (this.platForm.valid) {
      const formData = new FormData();
  
      Object.entries(this.platForm.value).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
  
      this.uploadedFiles.forEach(file => {
        formData.append('images', file); // 👈 même clé que backend
      });
  
      this.store.dispatch(createPlatWithFiles({ newData: formData }));
  
      this.actions$.pipe(
        ofType(createPlatWithFilesSuccess, createPlatWithFilesFailure),
        take(1)
      ).subscribe(action => {
        if (action.type === createPlatWithFilesSuccess.type) {
          this.toastService.success('Plat enregistré avec succès !', 'Succès');
          this.uploadedFiles = [];
          this.platForm.reset();
          this.closeAddModal();
        } else {
          this.toastService.error(action.error || 'Erreur inconnue', 'Erreur');
        }
      });
    } else {
      this.toastService.error('Veuillez remplir tous les champs requis.', 'Erreur');
    }
  }*/


    saveProperty() {
      if (this.platForm.valid) {
        const formData = new FormData();
        const isUpdate = !!this.platForm.get('id')?.value;
        const platId = this.platForm.get('id')?.value;
    
        // Ajouter tous les champs du formulaire
        Object.entries(this.platForm.value).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value.toString());
          }
        });
    
        // Ajouter les nouvelles images (Dropzone)
        this.uploadedFilesNouvelles.forEach(file => {
          formData.append('new_images', file);
        });
    
        // Ajouter les ID des images à supprimer
        this.imagesASupprimerIds.forEach(id => {
          formData.append('images_to_delete[]', id.toString());
        });
    
        if (isUpdate) {
          // 👇 Mise à jour avec fichiers via NgRx
          this.store.dispatch(updatePlatWithFiles({ id: platId, updatedData: formData }));
    
          this.actions$.pipe(
            ofType(updatePlatWithFilesSuccess, updatePlatWithFilesFailure),
            take(1)
          ).subscribe(action => {
            if (action.type === updatePlatWithFilesSuccess.type) {
              this.toastService.success('Plat mis à jour avec succès !', 'Succès');
              this.uploadedFilesNouvelles = [];
              this.imagesExistantes = [];
              this.imagesASupprimerIds = [];
              this.platForm.reset();
              this.closeAddModal();
            } else {
              this.toastService.error(action.error || 'Erreur inconnue', 'Erreur');
            }
          });
    
        } else {
          // 👇 Création avec fichiers
          this.store.dispatch(createPlatWithFiles({ newData: formData }));
    
          this.actions$.pipe(
            ofType(createPlatWithFilesSuccess, createPlatWithFilesFailure),
            take(1)
          ).subscribe(action => {
            if (action.type === createPlatWithFilesSuccess.type) {
              this.toastService.success('Plat enregistré avec succès !', 'Succès');
              this.uploadedFilesNouvelles = [];
              this.platForm.reset();
              this.closeAddModal();
            } else {
              this.toastService.error(action.error || 'Erreur inconnue', 'Erreur');
            }
          });
        }
    
      } else {
        this.toastService.error('Veuillez remplir tous les champs requis.', 'Erreur');
      }
    }
    
  
  
  
  
  // Delete Product
  removeItem(id: any) {
    // Stocker l'élément actif avant d'ouvrir la modal
    this.lastActiveElement = document.activeElement as HTMLElement;
    
    this.deleteID = id;
    this.deleteRecordModal?.show();
  }

  // Fermeture de la modal de suppression
  /*closeDeleteModal() {
    this.deleteRecordModal?.hide();
    // Rediriger le focus vers l'élément précédemment actif ou vers un élément visible
    setTimeout(() => {
      if (this.lastActiveElement) {
        this.lastActiveElement.focus();
      } else {
        // Fallback si lastActiveElement n'est pas défini
        const visibleElement = this.mainContainer?.nativeElement.querySelector('button');
        if (visibleElement) {
          visibleElement.focus();
        }
      }
    }, 100);
  }*/

    closeDeleteModal() {
      // D'abord déplacer le focus hors de la modal
      if (this.lastActiveElement) {
        this.lastActiveElement.focus();
      } else {
        document.body.focus();
      }
      
      setTimeout(() => {
        this.deleteRecordModal?.hide();
      }, 10);
    }

  // Suppression avec confirmation
confirmDelete(id?: any) {
  if (id) {
    // Suppression d'un élément spécifique
    this.store.dispatch(deleteplatData({ id: id.toString() }));
    this.toastService.success('Plat supprimé avec succès !', 'Succès');
    // Mettre à jour l'UI
    this.afterDeleteActions();
    return;
  }

  if (this.checkedValGet && this.checkedValGet.length > 0) {
    // Suppression multiple
    console.log("IDs à supprimer :", this.checkedValGet);
    this.store.dispatch(deletemultipleplatData({ id: this.checkedValGet.join(',') }));
    this.toastService.success('Plat supprimées avec succès !', 'Succès');
    
    // Mettre à jour l'UI
    this.afterDeleteActions();
    return;
  }

  // Aucun élément sélectionné
  this.toastService.error('Aucune plat sélectionnée pour suppression.', 'Erreur');
  this.closeDeleteModal();
}

// Actions à effectuer après une suppression
private afterDeleteActions() {
  this.closeDeleteModal();
  this.masterSelected = false;
  this.deleteID = null;
  this.checkedValGet = []; // Réinitialisation des éléments sélectionnés
}


  // Réinitialiser les cases à cocher
  resetCheckboxes() {
    if (this.plats) {
      this.plats.forEach((item: any) => {
        if (item) item.state = false;
      });
    }
    this.checkedValGet = [];
    
    // Réinitialiser également la case à cocher "Tout sélectionner"
    const selectAllCheckbox = document.querySelector('#select-all-checkbox') as HTMLInputElement;
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = false;
    }
  }

  // The master checkbox will check/uncheck all items
  checkUncheckAll(ev: any) {
    // S'assurer que plat est défini
    if (!this.plats) return;
    
    // Mettre à jour l'état de tous les éléments
    this.plats.forEach((x: any) => {
      if (x) {
        x.state = ev.target.checked;
      }
    });
    
    // Mettre à jour masterSelected
    this.masterSelected = ev.target.checked;
    
    // Recalculer checkedValGet
    this.updateCheckedValues();
  }

  // Select Checkbox value Get
  onCheckboxChange(e: any) {
    // Recalculer checkedValGet
    this.updateCheckedValues();
  }

  // Méthode utilitaire pour mettre à jour checkedValGet
  private updateCheckedValues() {
    const checkedVal: any[] = [];
    
    if (this.plats && this.plats.length > 0) {
      for (let i = 0; i < this.plats.length; i++) {
        if (this.plats[i] && this.plats[i].state === true) {
          checkedVal.push(this.plats[i].id);
        }
      }
    }
    
    this.checkedValGet = checkedVal;
    console.log('Éléments cochés:', this.checkedValGet);
  }

  // Sort Data
  onSort(column: any) {
    if (this.direction == 'asc') {
      this.direction = 'desc';
    } else {
      this.direction = 'asc';
    }
    const sortedArray = [...this.plats]; // Create a new array
    sortedArray.sort((a, b) => {
      const res = this.compare(a[column], b[column]);
      return this.direction === 'asc' ? res : -res;
    });
    this.plats = sortedArray;
  }
  
  compare(v1: string | number, v2: string | number) {
    return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
  }

  // filterdata
  filterdata() {
    if (this.term) {
      this.plats = this.platList.filter((el: any) => 
        el.titre?.toLowerCase().includes(this.term.toLowerCase()) || 
        el.id?.toString().includes(this.term)
      );
    } else {
      // Recharger les données du serveur si pas de terme de recherche
      this.loadData(this.currentPage);
    }
    // noResultElement
    this.updateNoResultDisplay();
  }

  // no result 
  updateNoResultDisplay() {
    const noResultElement = document.querySelector('.noresult') as HTMLElement;
    if (!noResultElement) return;

    if (this.term && this.plats.length === 0) {
      noResultElement.style.display = 'block';
    } else {
      noResultElement.style.display = 'none';
    }
  }

  // Page Changed
  pageChanged(event: PageChangedEvent): void {
    this.loadData(event.page);
  }

  // Ouvrir la modal de détails
viewDetails(id: any) {
  // Stocker l'élément actif avant d'ouvrir la modal
  this.lastActiveElement = document.activeElement as HTMLElement;
  
  // Trouver l'élément par ID
  const platData = this.plats.find(p => p.id === id);
  
  if (platData) {
    this.selectedPlat = platData;
    this.viewPlat?.show();
  } else {
    this.toastService.error('Plat introuvable', 'Erreur');
  }
}

// Fermer la modal de détails
closeViewModal() {
  // D'abord déplacer le focus hors de la modal
  if (this.lastActiveElement) {
    this.lastActiveElement.focus();
  } else {
    document.body.focus();
  }
  
  setTimeout(() => {
    this.viewPlat?.hide();
    this.selectedPlat = null;
  }, 10);
}

}