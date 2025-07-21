// pap-form.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LocalService } from 'src/app/core/services/local.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-pap-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,MatCardModule],
    
  templateUrl: './app-form.component.html',
  styleUrls: ['./app-form.component.css']
})
export class PapFormComponent implements OnInit {
  papForm: FormGroup;
imagePreview:boolean = false;
  constructor(private fb: FormBuilder, private localService: LocalService,private _matDialog: MatDialog,
  
  ) {
    // Initialisation du formulaire avec les contrôles et les validations
     this.initForm();
     this.libelleProject = this.localService.getData("libelleProject");
     this.imageUrl = this.localService.getData("ProjectLogo");
  }

    libelleProject: any;
  imageUrl: any;

  ngOnInit(): void {
   
  }

    private initForm(data: any = null): void {
    this.papForm = this.fb.group({
      version: [data?.version || '', Validators.required],
      category: [data?.category || '', Validators.required],
      localisation: [data?.localisation || '', Validators.required],
      codePAG: [data?.codePAG || '', Validators.required],
      prenomNom: [data?.prenomNom || '', Validators.required],
      sexe: [data?.sexe || '', Validators.required],
      dateNaissance: [data?.dateNaissance || '', Validators.required],
      lieuNaissance: [data?.lieuNaissance || '', Validators.required],
      age: [data?.age || '', [Validators.required, Validators.min(0)]],
      nationalite: [data?.nationalite || '', Validators.required],
      departement: [data?.departement || '', Validators.required],
      communeVillage: [data?.communeVillage || '', Validators.required],
      descriptionBiens: [data?.descriptionBiens || '', Validators.required],
      idPAP: [data?.idPAP || '', Validators.required],
      telephone: [
        data?.telephone || '', 
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)]
      ],
      statutMatrimonial: [data?.statutMatrimonial || '', Validators.required],
      membresMenage: [
        data?.membresMenage || '', 
        [Validators.required, Validators.min(1)]
      ],
      vulnerabilite: [data?.vulnerabilite || ''],
      typeHandicap: [data?.typeHandicap || ''],
      localisationPertes: [data?.localisationPertes || ''],
      pertesSurfacique: [data?.pertesSurfacique || '', [Validators.min(0), Validators.required]],
      pertesRecoltes: [data?.pertesRecoltes || '', [Validators.min(0), Validators.required]],
      compensationArbres: [data?.compensationArbres || '', [Validators.min(0), Validators.required]],
      compensationEquipements: [data?.compensationEquipements || '', [Validators.min(0), Validators.required]],
      pertesClotures: [data?.pertesClotures || '', [Validators.min(0), Validators.required]],
      indemniteTotale: [data?.indemniteTotale || '', [Validators.min(0), Validators.required]],
      paiementOption: [data?.paiementOption || '', Validators.required],
      observations: [data?.observations || '',Validators.required]
    });
  }


  onSubmit() {
    if (this.papForm.valid) {
      console.log('Formulaire soumis:', this.papForm.value);
      // Envoyer les données au serveur
    } else {
      console.log('Formulaire invalide');
      this.markAllAsTouched();
    }
  }

  markAllAsTouched() {
    Object.values(this.papForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  closeModal() {
     this._matDialog.closeAll();
  }

  onReset(): void {
    this.papForm.reset();
    this.showFormErrors = false;
  }
  showFormErrors = false;
  // private markAllAsTouched(): void {
  //   Object.values(this.papForm.controls).forEach(control => {
  //     control.markAsTouched();
  //   });
  // }

    validateFileType(control: AbstractControl): {[key: string]: any} | null {
    const file = control.value;
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        return { invalidFileType: true };
      }
    }
    return null;
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.papForm.get('photoPAP').setValue(file);
      this.papForm.get('photoPAP').markAsTouched();
    }
  }

  private scrollToFirstInvalidControl(): void {
    const firstInvalidControl = document.querySelector('.is-invalid');
    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}