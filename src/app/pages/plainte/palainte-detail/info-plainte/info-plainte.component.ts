import { PaginatorIntlFr } from "src/app/shared/core/paginator-intl-fr";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";

import { CoreService } from "src/app/shared/core/core.service";
import { CONSTANTES } from "src/app/shared/models/constantes";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { MatSort } from "@angular/material/sort";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { MessageService } from "src/app/shared/core/message.service";

@Component({
  selector: "info-plainte",
  templateUrl: "./info-plainte.component.html",
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [AngularMaterialModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: MatDialogRef,
      useValue: [],
    },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatPaginatorIntl, useClass: PaginatorIntlFr },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: "outline" },
    },
  ],

})
export class InfoPlainteComponent implements OnInit {

updateClient(arg0: any) {
throw new Error('Method not implemented.');
}
templateConsentementClient(arg0: any) {
throw new Error('Method not implemented.');
}
  _attributComplementaire = [];
  @Input() infosPlainte;
  @Input() persPhysique;
  @Input()
  set attributComplementaire(data: any) {
    this._attributComplementaire = data ? data : [];
  }
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  accountForm: UntypedFormGroup;
  data: any;
  paramsId: any;
  constantes = CONSTANTES;
  isLoading = false;
  dialogRef: any;
  naturePersonnesMorales: any = [];
  responsable: any = [];
  statutJuridiques: any = [];
  countries: any = [];
  listetemplate: any;

  /**
   * Constructor
   */
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private snackbar: SnackBarService,
    private messageService: MessageService,
    private _router: Router,
  ) //  private messageService: MessageService
  {
    // if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
    //     this.data = this.router.getCurrentNavigation().extras.state.extraData.data;
    // }

    this.route.params.subscribe((params) => {
      this.paramsId = params["id"];
    });
  }
  ngOnInit(): void {
    //  this.getListNaturePersonnesMorales();
    // // Create the form
    this.accountForm = this._formBuilder.group({
      name: ["Brian Hughes"],
      username: ["brianh"],
      title: ["Senior Frontend Developer"],
      company: ["YXZ Software"],
      about: [
        "Hey! This is Brian; husband, father and gamer. I'm mostly passionate about bleeding edge tech and chocolate! 🍫",
      ],
      email: ["hughes.brian@mail.com", Validators.email],
      phone: ["121-490-33-12"],
      country: ["usa"],
      language: ["english"],
    });

    // this.getListNaturePersonnesMorales();
    // this.getListresponsable();
    // this.getListStatutJuridique();
    // this.getListPays();
  }

  getAttributComplementaireClient(infosPlainte) {
    this.isLoading = true;
    const data = {
      natureAttribut: "CLIENT",
      referenceObjet: infosPlainte.id,
    };
    this.coreService
      .getAttributComplementaire(data, "attribut-complementaire/mine")
      .subscribe(
        (resp) => {
          if (
            resp[this.constantes.RESPONSE_CODE] ===
            this.constantes.HTTP_STATUS.SUCCESSFUL
          ) {
            this.isLoading = false;
            this._attributComplementaire = resp[this.constantes.RESPONSE_DATA];
            this._changeDetectorRef.markForCheck();
          } else {
            this.isLoading = false;
          }
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  getListNaturePersonnesMorales() {
    this.coreService
      .list("nature-personne-morale", 0, 1000)
      .subscribe((response) => {
        if (response["responseCode"] === 200) {
          this.naturePersonnesMorales = response["data"];
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  getListresponsable() {
    this.coreService
      .list("personne-physique", 0, 1000)
      .subscribe((response) => {
        if (response["responseCode"] === 200) {
          this.responsable = response["data"];
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  getListStatutJuridique() {
    this.coreService.list("statut-juridique", 0, 1000).subscribe((response) => {
      if (response["responseCode"] === 200) {
        this.statutJuridiques = response["data"];
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  getListPays() {
    this.coreService.list("pays", 0, 1000).subscribe((response) => {
      if (response["responseCode"] === 200) {
        this.countries = response["data"];
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  getNaturePersonneMorale(value: any) {
    const liste = this.naturePersonnesMorales.filter(
      (type) => type.id == value
    );
    return liste.length != 0 ? liste[0].libelle : value;
  }

  getResponsable(value: any) {
    const liste = this.responsable.filter((type) => type.id == value);
    return liste.length != 0 ? liste[0].prenom + " " + liste[0].nom : value;
  }

  getstatutJuridique(value: any) {
    const liste = this.statutJuridiques.filter((type) => type.id == value);
    return liste.length != 0 ? liste[0].libelle : value;
  }

  updateItems(information) {
    // this.snackbar.openModal( AjoutPersonnePhysiqueComponent, '50rem', 'edit', '', information, information.id, () => {
    //     this.relod();
    // });
  }

  relod() {
    window.location.reload();
  }
  updateItemsMoral(information) {
    // this.snackbar.openModal( AjoutPersonneMoraleComponent, '50rem', 'edit', '', information, information.id, () => {
    //     this.relod();
    // });
  }

  resolution(arg0: any) {
    this._router.navigate(["plainte/resolution"]);
  }

}
