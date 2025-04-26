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
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      message: ["", Validators.required],
      dateCreation: [new Date()],
    });
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
            "Votre mail a été envoyé avec succès! et vous serez contacté bientôt",
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

  topFeatures = [
    {
      title: "Gestion des parties prenantes",
      description: "Suivi de l'implication, des rôles, et des responsabilités.",
      image: "assets/images/GPP.png",
    },
    {
      title: "Suivi des projets",
      description: "Chronologie, jalons, et suivi de l'avancement.",
      image: "assets/images/SP.png",
    },
    {
      title: "Communication et collaboration",
      description:
        "Outils de communication entre les parties prenantes, partage de documents.",
      image: "assets/images/CC.png",
    },
    {
      title: "Carte interactive",
      description:
        "Carte de google map avec des géofences qui délimitent les zones affectées des projets",
      image: "assets/images/CI.png",
    },
  ];

  bottomFeatures = [
    {
      title: "Rapports et analyses",
      description:
        "Tableau de bord pour évaluer l'impact, le progrès et les besoins.",
      image: "assets/images/RA.png",
    },
    {
      title: "Gestion des plaintes",
      description:
        "Enregistrement, suivi et résolution des plaintes via un système traçable",
      image: "assets/images/GP.png",
    },
    {
      title: "Gestion des compensations",
      description:
        "Suivi des demandes, validation des critères, et versement des indemnités",
      image: "assets/images/GC.png",
    },
  ];

  //benefits

  benefits = [
    {
      title: "Les Gouvernements",
      description:
        "Amélioration de la coordination et de la transparence et assurance de la conformité",
      image: "assets/images/GOV.png",
    },
    {
      title: "Les Organismes Humanitaires",
      description: "Suivi des ressources et des besoins",
      image: "assets/images/ORG.png",
    },
    {
      title: "Les Communautés",
      description:
        "Garantie d'une meilleure prise en compte de leurs besoins et des délais respectés",
      image: "assets/images/COM.png",
    },
    {
      title: "Les Entreprises partenaires",
      description: "Optimisation des ressources et des logistiques",
      image: "assets/images/ENTR.png",
    },
    // {
    //   title: "Institutions financières de développement",
    //   description:
    //     "Amélioration du suivi environnemental et social des projets",
    //   image: "assets/images/institutions.png",
    // },
  ];

  benefitsOne = [
    {
      title: "Institutions financières de développement",
      description:
        "Amélioration du suivi environnemental et social des projets",
      image: "assets/images/INST.png",
    },
  ];

  isOpen: boolean = false;

toggle() {
  this.isOpen = !this.isOpen;
}


faqItems = [
  {
    question: "Qui peut utiliser Invodis ?",
    answer: "Everyone realizes why a new common language would be desirable...",
    isOpen: false
  },
  {
    question: "Comment Invodis garantit-elle la sécurité des données ?",
    answer: "If several languages coalesce, the grammar of the resulting...",
    isOpen: false
  },
  {
    question: "Quelles sont les localités concernées dans Invodis ?",
    answer: "It will be as simple as Occidental...",
    isOpen: false
  },
  {
    question: "Peut-on personnaliser Invodis pour des lois locales ?",
    answer: "To an English person, it will seem like simplified English...",
    isOpen: false
  },
  {
    question: "Comment les communautés sans internet y accèdent-elles ?",
    answer: "To an English person, it will seem like simplified English...",
    isOpen: false
  }
];


activeIndex: number | null = null;

  toggleItem(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

}
