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
import { addbesoinData, deletebesoinData, deletemultiplebesoinData, fetchbesoinData, updatebesoinData, updatebesoinDataSuccess,updatebesoinDataFailure, addbesoinDataSuccess, addbesoinDataFailure, fetchstatistiquebesoinData  } from 'src/app/store/Besoin/besoin.action';
import { selectbesoinData, selectTotalItems, selectLoading, selectCurrentPage, selectStatistiqueGlobale, selectStatistiqueLoading  } from 'src/app/store/Besoin/besoin-selector';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { cloneDeep } from 'lodash';
import { selecttypebesoinData } from 'src/app/store/Typebesoin/typebesoin-selector';
import { fetchtypebesoinData } from 'src/app/store/Typebesoin/typebesoin.action';
import { fetchuserData } from 'src/app/store/User/user.action';
import { selectuserData} from 'src/app/store/User/user-selector';
import { selectprioriteData} from 'src/app/store/Priorite/priorite-selector';
import { fetchprioriteData } from 'src/app/store/Priorite/priorite.action';
import { Actions, ofType } from '@ngrx/effects';


@Component({
  selector: 'app-list-besoin',
  templateUrl: './list-besoin.component.html',
  styleUrl: './list-besoin.component.scss',
  providers: [DecimalPipe]
})

// list Component
export class ListBesoinComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  besoins: any[] = [];
  besoinList: any[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  isLoading: boolean = true;

  besoinForm!: UntypedFormGroup;
  submitted = false;
  masterSelected!: boolean;
  term: any;
  files: File[] = [];
  checkedValGet: any[] = [];

  priorites: any[] = [];
  typebesoins: any[] = [];
  users: any[] = [];
  statistiques: {
    par_etat: { etat: string; nombre: number }[];
    par_priorite: { priorite: string; nombre: number }[];
    total_non_cloture: number;
    total_besoin: number;
  } | null = null;

  // Référence pour stocker l'élément qui avait le focus avant l'ouverture de la modal
  private lastActiveElement: HTMLElement | null = null;
  
  @ViewChild('addBesoin', { static: false }) addBesoin?: ModalDirective;
  @ViewChild('deleteRecordModal', { static: false }) deleteRecordModal?: ModalDirective;
  @ViewChild('mainContainer', { static: false }) mainContainer?: ElementRef;
  @ViewChild('viewBesoin', { static: false }) viewBesoin?: ModalDirective;
  selectedBesoin: any = null;
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
      { label: 'Besoin', active: true },
      { label: 'Besoin List', active: true }
    ];

    /**
     * Form Validation
     */
    this.besoinForm = this.formBuilder.group({
      id: [''],
      reference: ['BES-2025-141'],
      titre: ['', [Validators.required]],
      description: ['', [Validators.required]],
      typebesoin: ['', [Validators.required]],
      priorite: ['', [Validators.required]],
      user: ['', [Validators.required]],
      etat: ['1'],
      date_debut: ['2025-03-31T00:00:00Z'],
      date_fin: ['2025-04-01T00:00:00Z'],
      commentaire: ['tables'],
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
    this.store.select(selectbesoinData).subscribe(data => {
      if (data) {
        // Initialiser correctement les états
        this.besoins = data.map(item => ({
          ...item,
          state: false
        }));
        this.besoinList = [...this.besoins];
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

    // S'abonner aux données priorite
    this.store.select(selectprioriteData).subscribe(data => {
      if (data) {
        // Initialiser correctement les états
        this.priorites = data.map(item => ({
          ...item,
          state: false
        }));
      }
    });

    // S'abonner aux données type besoin
    this.store.select(selecttypebesoinData).subscribe(data => {
      if (data) {
        // Initialiser correctement les états
        this.typebesoins = data.map(item => ({
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

    // Charger les données initiales
    this.loadData(1);
  }

  ngAfterViewInit() {
    // Configuration de l'événement onHidden pour les modals
    if (this.addBesoin) {
      this.addBesoin.onHidden.subscribe(() => {
        // Réinitialiser le formulaire si nécessaire après fermeture
        this.besoinForm.reset();
        
        // Réinitialiser le texte du bouton et du titre
        const modaltitle = document.querySelector('.modal-title') as HTMLAreaElement;
        if (modaltitle) modaltitle.innerHTML = 'Ajouter un besoin';
        
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
    this.store.dispatch(fetchbesoinData({ page }));

    //pour le user, ne pas faire de pagination
    this.store.dispatch(fetchuserData({ page }));
    this.store.dispatch(fetchprioriteData({ page }));
    this.store.dispatch(fetchtypebesoinData({ page }));
    this.store.dispatch(fetchstatistiquebesoinData());
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
      this.besoinForm.controls['img'].setValue(event[0].dataURL);
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
    this.addBesoin?.show();
    const modaltitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modaltitle.innerHTML = 'Ajouter un besoin';
    const modalbtn = document.getElementById('add-btn') as HTMLAreaElement;
    modalbtn.innerHTML = 'Ajouter';
    
    // Réinitialiser le formulaire
    this.besoinForm.reset();
  }

  // Fermeture de la modal d'ajout
  /*closeAddModal() {
    this.addBesoin?.hide();
    
    // Réinitialiser le texte du bouton et du titre pour la prochaine utilisation
    const modaltitle = document.querySelector('.modal-title') as HTMLAreaElement;
    if (modaltitle) modaltitle.innerHTML = 'Ajouter une besoin';
    
    const modalbtn = document.getElementById('add-btn') as HTMLAreaElement;
    if (modalbtn) modalbtn.innerHTML = 'Ajouter';
    
    // Rediriger le focus vers l'élément précédemment actif
    setTimeout(() => {
      if (this.lastActiveElement) {
        this.lastActiveElement.focus();
      }
    }, 100);
    this.besoinForm.reset();
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
      this.addBesoin?.hide();
      
      // Réinitialiser le texte du bouton et du titre
      const modaltitle = document.querySelector('.modal-title') as HTMLAreaElement;
      if (modaltitle) modaltitle.innerHTML = 'Ajouter un besoin';
      
      const modalbtn = document.getElementById('add-btn') as HTMLAreaElement;
      if (modalbtn) modalbtn.innerHTML = 'Ajouter';
    }, 10);
  }

  // Edit Data
  editList(id: any) {
    // Stocker l'élément actif avant d'ouvrir la modal
    this.lastActiveElement = document.activeElement as HTMLElement;
    
    this.addBesoin?.show();
    const modaltitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modaltitle.innerHTML = "Modifier le besoin";
    const modalbtn = document.getElementById('add-btn') as HTMLAreaElement;
    modalbtn.innerHTML = 'Mettre à jour';
    
    // Trouver l'élément par index ou id
    const editData = typeof id === 'number' ? this.besoins[id] : this.besoins.find(p => p.id === id);
    
    if (editData) {
      if (this.uploadedFiles.length > 0) {
        this.uploadedFiles = [];  // Vider d'abord
      }
      if (editData.img) {
        this.uploadedFiles.push({ 'dataURL': editData.img, 'name': editData.imgalt, 'size': 1024 });
      }
      this.besoinForm.patchValue(editData);
    }
  }

  // Add/Update Property
  saveProperty() {
    console.log(this.besoinForm.value)
    if (this.besoinForm.valid) {
      let formValue = { ...this.besoinForm.value };
  
      // Si `id` est vide, on le supprime avant d'envoyer les données
      if (!formValue.id) {
        delete formValue.id;
      }
  
      // Si l'ID existe, on met à jour les données, sinon on les ajoute
      if (this.besoinForm.get('id')?.value) {
        // L'ID existe, donc on met à jour
        const updatedData = formValue;
        this.store.dispatch(updatebesoinData({ updatedData }));
        
        this.actions$.pipe(
          ofType(updatebesoinDataSuccess, updatebesoinDataFailure),
          take(1)
        ).subscribe(action => {
          if (action.type === updatebesoinDataSuccess.type) {
            this.toastService.success('Besoin mis à jour avec succès !', 'Succès');
          } else {
            this.toastService.error('Échec lors de la mise à jour du besoin.', 'Erreur');
          }
        });
      } else {
        // L'ID est vide, on crée une nouvelle entrée
        const newData = formValue;
        this.store.dispatch(addbesoinData({ newData }));
        //this.toastService.success('Besoin ajoutée avec succès !', 'Succès');
        this.actions$.pipe(
          ofType(addbesoinDataSuccess, addbesoinDataFailure),
          take(1)
        ).subscribe(action => {
          if (action.type === addbesoinDataSuccess.type) {
            this.toastService.success('Besoin ajoutée avec succès !', 'Succès');
          } else {
            this.toastService.error('Échec lors de l\'ajout du besoin.', 'Erreur');
          }
        });
      }
  
      // Réinitialisation de l'interface
      this.uploadedFiles = [];
      this.besoinForm.reset();
  
      // Fermeture du modal
      this.closeAddModal();
    } else {
      this.toastService.error('Veuillez vérifier les informations saisies.', 'Erreur');
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
    this.store.dispatch(deletebesoinData({ id: id.toString() }));
    this.toastService.success('Besoin supprimé avec succès !', 'Succès');
    // Mettre à jour l'UI
    this.afterDeleteActions();
    return;
  }

  if (this.checkedValGet && this.checkedValGet.length > 0) {
    // Suppression multiple
    console.log("IDs à supprimer :", this.checkedValGet);
    this.store.dispatch(deletemultiplebesoinData({ id: this.checkedValGet.join(',') }));
    this.toastService.success('Besoin supprimées avec succès !', 'Succès');
    
    // Mettre à jour l'UI
    this.afterDeleteActions();
    return;
  }

  // Aucun élément sélectionné
  this.toastService.error('Aucune besoin sélectionnée pour suppression.', 'Erreur');
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
    if (this.besoins) {
      this.besoins.forEach((item: any) => {
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
    // S'assurer que besoin est défini
    if (!this.besoins) return;
    
    // Mettre à jour l'état de tous les éléments
    this.besoins.forEach((x: any) => {
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
    
    if (this.besoins && this.besoins.length > 0) {
      for (let i = 0; i < this.besoins.length; i++) {
        if (this.besoins[i] && this.besoins[i].state === true) {
          checkedVal.push(this.besoins[i].id);
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
    const sortedArray = [...this.besoins]; // Create a new array
    sortedArray.sort((a, b) => {
      const res = this.compare(a[column], b[column]);
      return this.direction === 'asc' ? res : -res;
    });
    this.besoins = sortedArray;
  }
  
  compare(v1: string | number, v2: string | number) {
    return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
  }

  // filterdata
  filterdata() {
    if (this.term) {
      this.besoins = this.besoinList.filter((el: any) => 
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

    if (this.term && this.besoins.length === 0) {
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
  const besoinData = this.besoins.find(p => p.id === id);
  
  if (besoinData) {
    this.selectedBesoin = besoinData;
    this.viewBesoin?.show();
  } else {
    this.toastService.error('Besoin introuvable', 'Erreur');
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
    this.viewBesoin?.hide();
    this.selectedBesoin = null;
  }, 10);
}

}