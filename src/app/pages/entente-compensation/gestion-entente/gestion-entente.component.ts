import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Import des composants Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { EntenteService } from 'src/app/core/services/entente.service';
import { ProcessusEntenteService } from 'src/app/core/services/processus-entente.service';
import { ModificationEntenteService } from 'src/app/core/services/modification-entente.service';
import { AngularMaterialModule } from 'src/app/shared/angular-materiel-module/angular-materiel-module';
import { LocalService } from 'src/app/core/services/local.service';
import { ToastrService } from 'ngx-toastr';
import { SnackBarService } from 'src/app/shared/core/snackBar.service';
import { ImageModalComponent } from 'src/app/shared/image-modal.component';
import { SignatureComponent } from '../signature/signature.component';
import { UIModule } from 'src/app/shared/ui/ui.module';

@Component({
  standalone: true,
  selector: 'app-gestion-entente',
  templateUrl: './gestion-entente.component.html',
  styleUrls: ['./gestion-entente.component.css'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatListModule,
    AngularMaterialModule,
    FormsModule,
    UIModule
  ],providers: [
    FormBuilder
  ]
})
export class GestionEntenteComponent implements OnInit {
  ententeDetails: any;
  loading = false;
  action: string='';
  
  modificationsForm: FormGroup;
  informationForm: FormGroup;
  propagerVersPapSource = false;
  
  historiqueModifications: any[] = [];
  user: any;

  constructor(
    public matDialogRef: MatDialogRef<GestionEntenteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private ententeService: EntenteService,
    private processusService: ProcessusEntenteService,
    private modificationService: ModificationEntenteService,
    private localService: LocalService,
    public toastr: ToastrService,
    private snackbar: SnackBarService,
     private dialog: MatDialog,
    
    
    
  ) {
    console.log('data reçue:', data);
    this.action = data.action;
    this.ententeDetails = data.data; // Chargement direct depuis les données
    console.log('ententeDetails:', this.ententeDetails);
    this.user = this.localService.getDataJson("user");

    console.log('Utilisateur courant:', this.user.email);

    
    // Initialisation des formulaires
    this.modificationsForm = this.fb.group({
      perteTotale: [null],
      fraisDeplacement: [null],
      appuiRelocalisation: [null],
      perteRevenue: [null],
      perteBatiment: [null],
      perteLoyer: [null],
      perteCloture: [null],
      perteArbreJeune: [null],
      perteArbreAdulte: [null],
      perteEquipement: [null],
      modePaiement: [''],
      optionPaiement: [''],
      numeroTelephone: [''],
      raisonModification: ['', Validators.required]
    });

    this.informationForm = this.fb.group({
      modeInformation: ['', Validators.required],
      detailsInformation: ['']
    });
  }

  ngOnInit(): void {
     this.prechargerDonneesModification();
    this.determinerEtapeActuelle();
    //  this.loadHistoriqueModifications();
  }

  prechargerDonneesModification(): void {
    if (this.ententeDetails) {
      // Précharger les données dans le formulaire de modifications
      this.modificationsForm.patchValue({
        perteTotale: this.ententeDetails.perteTotale,
        fraisDeplacement: this.ententeDetails.fraisDeplacement,
        appuiRelocalisation: this.ententeDetails.appuiRelocalisation,
        perteRevenue: this.ententeDetails.perteRevenue,
        perteBatiment: this.ententeDetails.perteBatiment,
        perteLoyer: this.ententeDetails.perteLoyer,
        perteCloture: this.ententeDetails.perteCloture,
        perteArbreJeune: this.ententeDetails.perteArbreJeune,
        perteArbreAdulte: this.ententeDetails.perteArbreAdulte,
        perteEquipement: this.ententeDetails.perteEquipement,
        modePaiement: this.ententeDetails.modePaiement,
        optionPaiement: this.ententeDetails.optionPaiement,
        numeroTelephone: this.ententeDetails.numeroTelephone
      });
    }
  }

synchroniserEntente(): void {
  this.snackbar
    .showConfirmation('Voulez-vous vraiment synchroniser cette entente ?')
    .then((confirmed) => {
      if (confirmed) {
        this.executerSynchronisation();
      }
    });
}

private executerSynchronisation(): void {
  console.log('Synchronisation de l\'entente ID:', this.ententeDetails.ententeId);
  this.loading = true;
  
  this.ententeService.synchroniserEntente(this.ententeDetails.papId).subscribe({
    next: (response: any) => {
      if (response && response.responseCode == 200) {
        this.snackbar.showSuccess('Entente synchronisée avec succès');
        this.matDialogRef.close();
        this.prechargerDonneesModification();
        this.loading = false;
      }        
    },
    error: (error) => {
      console.error('Erreur synchronisation:', error);
      this.snackbar.showError('Erreur lors de la synchronisation');
      this.loading = false;
    }
  });
}

  // finaliserEntente(): void {
  //   if (confirm('Êtes-vous sûr de vouloir finaliser cette entente ? Cette action est irréversible.')) {
  //     this.loading = true;
  //     this.ententeService.finaliserEntente(this.ententeDetails.ententeId).subscribe({
  //       next: (updatedEntente) => {
  //         this.ententeDetails = updatedEntente;
  //         this.prechargerDonneesModification();
  //         this.loading = false;
  //         this.matDialogRef.close(true);
  //       },
  //       error: (error) => {
  //         console.error('Erreur finalisation:', error);
  //         this.loading = false;
  //       }
  //     });
  //   }
  // }

  finaliserEntente(): void {
  this.snackbar
    .showConfirmation('Voulez-vous vraiment finaliser cette entente ?')
    .then((confirmed) => {
      if (confirmed) {
        this.executerFinalisation();
      }
    });
}


preuveAccord: any = null  ;
preuvePaiement: any = null  ;


// Fonction pour calculer le total de compensation
  calculerTotalCompensation(): number {
    if (!this.ententeDetails) return 0;
    
    return (
      (this.ententeDetails.perteTotale || 0) +
      (this.ententeDetails.fraisDeplacement || 0) +
      (this.ententeDetails.appuiRelocalisation || 0) +
      (this.ententeDetails.perteRevenue || 0) +
      (this.ententeDetails.perteBatiment || 0) +
      (this.ententeDetails.perteLoyer || 0) +
      (this.ententeDetails.perteCloture || 0) +
      (this.ententeDetails.perteArbreJeune || 0) +
      (this.ententeDetails.perteArbreAdulte || 0) +
      (this.ententeDetails.perteEquipement || 0)
    );
  }
  formatMontant(montant: number): string {
    if (montant === null || montant === undefined) {
      return '0 CFA';
    }
    
    // Formater le nombre avec séparateurs de milliers
    const formattedValue = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(montant);
    
    return `${formattedValue} CFA`;
  }

  dialogRef: any;

    openImageModal(imageUrl: string) {
      if (imageUrl) {
        this.dialog.open(ImageModalComponent, {
          data: { imageUrl: imageUrl },
        });
      }
    }

      signatureClient(val: string): void {
        this.dialogRef = this.dialog.open(SignatureComponent, {
          autoFocus: true,
          width: "35rem",
          panelClass: "event-form-dialog",
          disableClose: true,
          data: {
            action: "new",
          },
        });
        this.dialogRef.afterClosed().subscribe((signatureUrl) => {
          if (signatureUrl) {
            this.preuveAccord = signatureUrl;
            console.log('Signature URL reçue:', signatureUrl);
            
          }
        });
      }



      getPreuvePaiement(val: string): void {
        this.dialogRef = this.dialog.open(SignatureComponent, {
          autoFocus: true,
          width: "35rem",
          panelClass: "event-form-dialog",
          disableClose: true,
          data: {
            action: "new",
          },
        });
        this.dialogRef.afterClosed().subscribe((preuvePaiement) => {
          if (preuvePaiement) {
            this.preuvePaiement = preuvePaiement;
            console.log('Preuve de paiement reçue:', preuvePaiement);
          }
        });
      }





typeFormation: string = '';
formateur: string = '';

resultatSuivi: string = '';
commentairesSuivi: string = '';



private executerFinalisation(): void {
  console.log('Finalisation de l\'entente ID:', this.ententeDetails.papId);
  this.loading = true;
  
  this.ententeService.finaliserEntente(this.ententeDetails.papId).subscribe({
    next: (response: any) => {
      if (response && response.responseCode == 200) {
        this.snackbar.showSuccess('Entente finalisée avec succès');
        this.matDialogRef.close();
        this.prechargerDonneesModification();
        this.loading = false;
      }        
    },
    error: (error) => {
      console.error('Erreur finalisation:', error);
      this.snackbar.showError('Erreur lors de la finalisation');
      this.loading = false;
    }
  });
}

  validerEtape(etape: string): void {
    this.loading = true;
    switch (etape) {
      case 'compensation':
        this.processusService.etablirCompensation(this.ententeDetails.papId).subscribe({
          next: (updatedEntente) => {
            this.ententeDetails = updatedEntente;
            this.loading = false;
          },
          error: (error) => this.handleEtapeError(error)
        });
        break;
      
      case 'information':
        const infoData = this.informationForm.value;
        this.processusService.informerPap(
          this.ententeDetails.papId, 
          infoData.modeInformation,
          infoData.detailsInformation
        ).subscribe({
          next: (updatedEntente) => {
            this.ententeDetails = updatedEntente;
            this.informationForm.reset();
            this.nextStep();
            this.loading = false;
          },
          error: (error) => this.handleEtapeError(error)
        });
        break;
      
      case 'accord':
        this.processusService.obtenirAccordPap(this.ententeDetails.papId,this.preuveAccord).subscribe({
          next: (updatedEntente) => {
            this.ententeDetails = updatedEntente;
            this.nextStep();
            this.loading = false;
          },
          error: (error) => this.handleEtapeError(error)
        });
        break;
      
      case 'paiement':
        this.processusService.effectuerPaiement(this.ententeDetails.papId,this.preuvePaiement).subscribe({
          next: (updatedEntente) => {
            this.ententeDetails = updatedEntente;
             this.nextStep();
            this.loading = false;
          },
          error: (error) => this.handleEtapeError(error)
        });
        break;
      
      case 'formation':
      this.processusService.donnerFormation(
      this.ententeDetails.papId, 
      this.typeFormation, 
      this.formateur
    ).subscribe({
      next: (response) => {
        this.ententeDetails = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la validation de la formation', error);
        this.loading = false;
      }
    });
        break;
      case 'suivi':
      this.processusService.effectuerSuivi(
      this.ententeDetails.papId, 
      this.resultatSuivi, 
      this.commentairesSuivi
    ).subscribe({
      next: (response) => {
        this.ententeDetails = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la validation du suivi', error);
        this.loading = false;
      }
    });
      break;
    }
  }

  handleEtapeError(error: any): void {
    console.error('Erreur lors de l\'étape:', error);
    this.loading = false;
  }

appliquerModifications(): void {
  if (this.modificationsForm.invalid) {
    this.snackbar.showError('Veuillez fournir une raison pour la modification');
    return;
  }

  const formValue = this.modificationsForm.value;
  const modifications = {};
  
  // Filtrer seulement les champs modifiés
  Object.keys(formValue).forEach(champ => {
    if (champ !== 'raisonModification' && 
        formValue[champ] !== null && 
        formValue[champ] !== undefined && 
        formValue[champ] !== this.ententeDetails[champ]) {
      modifications[champ] = formValue[champ];
    }
  });

  if (Object.keys(modifications).length === 0) {
    this.snackbar.showWarning('Aucune modification détectée');
    return;
  }

  // Afficher la confirmation avec snackbar
  this.snackbar
    .showConfirmation(`Voulez-vous vraiment modifier cette entente ?`)
    .then((confirmed) => {
      if (confirmed) {
        this.executerModification(formValue, modifications);
      }
    });
}

private executerModification(formValue: any, modifications: any): void {
  const modificationDTO = {
    ententeId: this.ententeDetails.papId,
    modifications: modifications,
    raisonModification: formValue.raisonModification,
    email: this.user.email,
    // propagerVersPapSource: this.propagerVersPapSource
  };

  console.log('Modifications à appliquer:', modificationDTO);
  
  this.loading = true;
  this.modificationService.modifierValeurs(modificationDTO, this.ententeDetails.papId).subscribe({
    next: (response: any) => {
      console.log('Réponse modification:', response);
      if(response && response.responseCode == 200){
        this.toastr.success(response.message);
        // this.ententeDetails = response;
       this.matDialogRef.close();
        this.prechargerDonneesModification();
        this.modificationsForm.get('raisonModification')?.reset();
        this.loading = false;
        this.loadHistoriqueModifications();
      }
    },
    error: (error) => {
      console.error('Erreur modification:', error);
      this.snackbar.showError('Erreur lors de la modification');
      this.loading = false;
    }
  });
}

  loadHistoriqueModifications(): void {
    if (this.ententeDetails?.ententeId) {
      this.modificationService.getHistoriqueModifications(this.ententeDetails.papId).subscribe({
        next: (historique) => {
          this.historiqueModifications = historique;
        },
        error: (error) => {
          console.error('Erreur chargement historique:', error);
        }
      });
    }
  }

  canEditField(champ: string): boolean {
    if (this.ententeDetails?.statut === 'FINALISEE') {
      return false;
    }

    const champsEditables = {
      'perteTotale': ['BROUILLON', 'SYNCHRONISEE'],
      'fraisDeplacement': ['BROUILLON', 'SYNCHRONISEE'],
      'appuiRelocalisation': ['BROUILLON', 'SYNCHRONISEE'],
      'perteRevenue': ['BROUILLON', 'SYNCHRONISEE'],
      'perteBatiment': ['BROUILLON', 'SYNCHRONISEE'],
      'perteLoyer': ['BROUILLON', 'SYNCHRONISEE'],
      'perteCloture': ['BROUILLON', 'SYNCHRONISEE'],
      'perteArbreJeune': ['BROUILLON', 'SYNCHRONISEE'],
      'perteArbreAdulte': ['BROUILLON', 'SYNCHRONISEE'],
      'perteEquipement': ['BROUILLON', 'SYNCHRONISEE'],
      'modePaiement': ['BROUILLON', 'SYNCHRONISEE'],
      'optionPaiement': ['BROUILLON', 'SYNCHRONISEE'],
      'numeroTelephone': ['BROUILLON', 'SYNCHRONISEE']
    };

    return champsEditables[champ]?.includes(this.ententeDetails?.statut) || false;
  }

getStatusStyle(statut: string): any {
  const styles: {[key: string]: any} = {
    'BROUILLON': { 'background-color': '#fef3c7', 'color': '#92400e' },
    'SYNCHRONISEE': { 'background-color': '#dbeafe', 'color': '#1e40af' },
    'FINALISEE': { 'background-color': '#d1fae5', 'color': '#065f46' }
  };
  return styles[statut] || { 'background-color': '#f3f4f6', 'color': '#374151' };
}

getProcessStyle(etat: string): any {
  const styles: {[key: string]: any} = {
    'COMPENSATION_A_ETABLIR': { 'background-color': '#ffedd5', 'color': '#9a3412' },
    'PAP_A_INFORMER': { 'background-color': '#f3e8ff', 'color': '#7e22ce' },
    'ACCORD_A_OBTENIR': { 'background-color': '#e0e7ff', 'color': '#3730a3' },
    'PROCESSUS_TERMINE': { 'background-color': '#d1fae5', 'color': '#065f46' }
  };
  return styles[etat] || { 'background-color': '#f3f4f6', 'color': '#374151' };
}


// Propriétés à ajouter
steps = ['compensation', 'information', 'accord', 'paiement', 'formation', 'suivi'];
currentStepIndex = 0;
currentStep: string;
selectedFile: File | null = null;
paiementFile: File | null = null;

  

  isEtapeComplete(etape: string): boolean {
    switch (etape) {
      case 'compensation': return this.ententeDetails?.compensationEtablie;
      case 'information': return this.ententeDetails?.papInformee;
      case 'accord': return this.ententeDetails?.accordPapObtenu;
      case 'paiement': return this.ententeDetails?.paiementEffectue;
      case 'formation': return this.ententeDetails?.formationDonnee;
      case 'suivi': return this.ententeDetails?.suiviEffectue;
      default: return false;
    }
  }

  determinerEtapeActuelle(): void {
  if (!this.ententeDetails.compensationEtablie) {
    this.currentStepIndex = 0;
  } else if (!this.ententeDetails.papInformee) {
    this.currentStepIndex = 1;
  } else if (!this.ententeDetails.accordPapObtenu) {
    this.currentStepIndex = 2;
  } else if (!this.ententeDetails.paiementEffectue) {
    this.currentStepIndex = 3;
  } else if (!this.ententeDetails.formationDonnee) {
    this.currentStepIndex = 4;
  } else if (!this.ententeDetails.suiviEffectue) {
    this.currentStepIndex = 5;
  } else {
    this.currentStepIndex = this.steps.length - 1;
  }
  
  this.currentStep = this.steps[this.currentStepIndex];
}

isStepActive(step: string): boolean {
  return this.currentStep === step;
}

isStepCompleted(step: string): boolean {
  switch(step) {
    case 'compensation': return this.ententeDetails.compensationEtablie;
    case 'information': return this.ententeDetails.papInformee;
    case 'accord': return this.ententeDetails.accordPapObtenu;
    case 'paiement': return this.ententeDetails.paiementEffectue;
    case 'formation': return this.ententeDetails.formationDonnee;
    case 'suivi': return this.ententeDetails.suiviEffectue;
    default: return false;
  }
}

getStepTitle(step: string): string {
  const titles = {
    'compensation': 'Établissement de la Compensation',
    'information': 'Information du PAP',
    'accord': 'Obtention de l\'Accord',
    'paiement': 'Paiement de la Compensation',
    'formation': 'Formation du PAP',
    'suivi': 'Suivi Post-Compensation'
  };
  return titles[step] || 'Étape inconnue';
}

nextStep(): void {
  if (this.currentStepIndex < this.steps.length - 1) {
    this.currentStepIndex++;
    this.currentStep = this.steps[this.currentStepIndex];
  }
}

previousStep(): void {
  if (this.currentStepIndex > 0) {
    this.currentStepIndex--;
    this.currentStep = this.steps[this.currentStepIndex];
  }
}

isFirstStep(): boolean {
  return this.currentStepIndex === 0;
}

isLastStep(): boolean {
  return this.currentStepIndex === this.steps.length - 1;
}


onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.getPreuvePaiement(file);
  }
}





onPaiementFileSelected(event: any): void {
  this.paiementFile = event.target.files[0];
}

}