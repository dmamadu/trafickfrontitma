import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { interval } from "rxjs";
import { map } from "rxjs/operators";
import { ComplaintServiceService } from "../pages/home-page/complaint-service.service";
import { ContactService } from "../pages/home-page/contact.service";
import { SnackBarService } from "../shared/core/snackBar.service";

@Component({
  selector: "app-cyptolanding",
  templateUrl: "./cyptolanding.component.html",
  styleUrls: ["./cyptolanding.component.scss"],
})

/**
 * Crypto landing page
 */
export class CyptolandingComponent implements OnInit {
  // set the currenr year
  year: number = new Date().getFullYear();
  currentSection: any = "home";

  // Timeline config
  slideConfig = {
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
  };
  // Team config
  config = {
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    dots: false,
  };
  // About config
  aboutConfig = {
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    dots: false,
  };

  private _trialEndsAt;

  private _diff: number;
  _days: number;
  _hours: number;
  _minutes: number;
  _seconds: number;
  isMenuOpen: any;

  ngOnInit() {
    this._trialEndsAt = "2023-12-31";

    interval(3000)
      .pipe(
        map((x) => {
          this._diff =
            Date.parse(this._trialEndsAt) - Date.parse(new Date().toString());
        })
      )
      .subscribe((x) => {
        this._days = this.getDays(this._diff);
        this._hours = this.getHours(this._diff);
        this._minutes = this.getMinutes(this._diff);
        this._seconds = this.getSeconds(this._diff);
      });

    this.initForm();
    this.initComplaintForm();
  }

  getDays(t) {
    return Math.floor(t / (1000 * 60 * 60 * 24));
  }

  getHours(t) {
    return Math.floor((t / (1000 * 60 * 60)) % 24);
  }

  getMinutes(t) {
    return Math.floor((t / 1000 / 60) % 60);
  }

  getSeconds(t) {
    return Math.floor((t / 1000) % 60);
  }

  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
  }
  /**
   * Window scroll method
   */
  windowScroll() {
    const navbar = document.getElementById("navbar");
    if (
      document.body.scrollTop >= 50 ||
      document.documentElement.scrollTop >= 50
    ) {
      navbar.classList.add("nav-sticky");
    } else {
      navbar.classList.remove("nav-sticky");
    }
  }

  /**
   * Toggle navbar
   */
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /**
   * Section changed method
   * @param sectionId specify the current sectionID
   */
  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }

  complaintForm: FormGroup;
  contactForm: FormGroup;
  loader: boolean = false;

  modalOpen: boolean = false;
  complaint = {
    type: "",
    description: "",
  };

  constructor(
    private fb: FormBuilder,
    private complaintService: ComplaintServiceService,
    private contactService: ContactService,
    private snackbar: SnackBarService
  ) {}

  openComplaintModal() {
    this.modalOpen = true;
  }

  closeComplaintModal() {
    this.modalOpen = false;
  }

  // Fonction d'initialisation du formulaire
  private initForm() {
    this.contactForm = this.fb.group({
      motif: ["", Validators.required],
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", Validators.required],
      subject: ["", Validators.required],
      message: ["", Validators.required],
      dateCreation: [new Date()],
    });
  }

  // Fonction d'initialisation du formulaire
  private initComplaintForm() {
    this.complaintForm = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.required]],
      complaintType: ["", Validators.required],
      complaintDescription: ["", Validators.required],
    });
  }

  errorMessage: string = "";
  // Soumettre la plainte
  submitComplaint() {
    console.log(this.complaintForm.value);

    if (this.complaintForm.valid) {
      const complaintData = this.complaintForm.value;
      this.complaintService.submitComplaint(complaintData).subscribe(
        (response) => {
          console.log("Réponse du serveur :", response);
          this.closeComplaintModal();
          this.snackbar.openSnackBar(
            "Votre plainte a été enregistrée avec succés,Nous vous contacterons bientôt",
            "OK",
            ["mycssSnackbarGreen"]
          );
          this.complaintForm.reset();
        },
        (error) => {
          console.error("Erreur lors de l'envoi de la plainte :", error);
          this.snackbar.showErrors(error);
        }
      );
    } else {
      this.errorMessage = "Veuillez remplir correctement tous les champs.";
      // this.snackbar.openSnackBar(
      //   "Veuillez remplir correctement tous les champs.",
      //   "OK",
      //   ["mycssSnackbarRed"]
      // );
    }
  }

  onSubmit() {
    this.contactForm.markAllAsTouched();
    if (this.contactForm.valid) {
      this.loader = true;
      const formData = this.contactForm.value;
      console.log("Form Data:", formData);
      this.contactService.sendContactForm(formData).subscribe(
        (response) => {
          console.log("Réponse du serveur:", response);
          this.snackbar.openSnackBar(
            "Votre mail a été envoyé avec succès! ,et vous serez contacté bientôt",
            "OK",
            ["mycssSnackbarGreen"]
          );
          this.loader = false;
          this.contactForm.reset();
        },
        (error) => {
          console.error("Erreur lors de l'envoi du message:", error);
          this.snackbar.openSnackBar(error, "OK", ["mycssSnackbarRed"]);
          this.loader = false;
        }
      );
    }
  }
}
