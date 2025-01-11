import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { ComplaintServiceService } from "../complaint-service.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ContactService } from "../contact.service";
import { MatProgressBar, MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UIModule } from "../../../shared/ui/ui.module";

@Component({
  selector: "app-main-content",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BrowserModule, MatProgressBarModule, MatProgressSpinnerModule, UIModule],
  templateUrl: "./main-content.component.html",
  styleUrl: "./main-content.component.css",
})
export class MainContentComponent implements OnInit {
  complaintForm: FormGroup;
  contactForm: FormGroup;
  loader:boolean = false;

  modalOpen: boolean = false;
  complaint = {
    type: "",
    description: "",
  };

  constructor(
    private fb: FormBuilder,
    private complaintService: ComplaintServiceService,
    private contactService: ContactService,
    private snackbar: SnackBarService,
  ) {}
  ngOnInit(): void {
    this.initForm();
    this.initComplaintForm();
  }


  openComplaintModal() {
    this.modalOpen = true;
  }

  closeComplaintModal() {
    this.modalOpen = false;
  }


   // Fonction d'initialisation du formulaire
   private initForm() {
    this.contactForm = this.fb.group({
      motif: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      dateCreation:[new Date()]
    });
  }

   // Fonction d'initialisation du formulaire
   private initComplaintForm() {
    this.complaintForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      complaintType: ['', Validators.required],
      complaintDescription: ['', Validators.required]
    });
  }


  // Soumettre la plainte
  submitComplaint() {
    console.log(this.complaintForm.value);
    if (this.complaintForm.valid) {
      const complaintData = this.complaintForm.value;
      this.loader=true;
      this.complaintService.submitComplaint(complaintData).subscribe(
        (response) => {
          console.log("Réponse du serveur :", response);
          this.closeComplaintModal();
          this.snackbar.openSnackBar(
            "Votre plainte a été enregistrée avec succés,Nous vous contacterons bientôt",
            "OK",
            ["mycssSnackbarGreen"]
          );
          this.loader=false;
        },
        (error) => {
          console.error("Erreur lors de l'envoi de la plainte :", error);
          this.snackbar.showErrors(error);
          this.loader=false;
        }

      );
    } else {
      this.snackbar.openSnackBar("Veuillez remplir correctement tous les champs.", "OK", [
        "mycssSnackbarRed",
      ]);

    }
  }


  onSubmit() {
    this.contactForm.markAllAsTouched();
    if (this.contactForm.valid) {
      this.loader = true;
      const formData = this.contactForm.value;
      console.log('Form Data:', formData);
      this.contactService.sendContactForm(formData).subscribe(
        (response) => {
          console.log('Réponse du serveur:', response);
          this.snackbar.openSnackBar(
            "Votre mail a été envoyé avec succès! ,et vous serez contacté bientôt",
            "OK",
            ["mycssSnackbarGreen"]
          );
          this.loader = false;
          this.contactForm.reset()
        },
        (error) => {
          console.error('Erreur lors de l\'envoi du message:', error);
          this.snackbar.openSnackBar(error, "OK", ["mycssSnackbarRed"]);
          this.loader = false;
        }
      );
    }
  }
}
