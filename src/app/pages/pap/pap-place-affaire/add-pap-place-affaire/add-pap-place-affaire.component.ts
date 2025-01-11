import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { MatDrawer } from "@angular/material/sidenav";
import { MatStepper } from "@angular/material/stepper";
import * as moment from "moment";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { DatePipe } from "@angular/common";
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from "@angular/material/core";
import { LocalService } from "src/app/core/services/local.service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { ClientVueService } from "src/app/pages/admin/client-vue/client-vue.service";
import { environment } from "src/environments/environment";

@Component({
  selector: 'app-add-pap-place-affaire',
  standalone: true,
  templateUrl: './add-pap-place-affaire.component.html',
  styleUrl: './add-pap-place-affaire.component.css',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    AngularMaterialModule,
    MatDatepickerModule,
    MatNativeDateModule, //
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: "fr-FR" },
    { provide: MatPaginatorIntl },
    SnackBarService,
    MatDatepickerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddPapPlaceAffaireComponent {

  panelOpenState = false;
  @ViewChild("drawer") drawer: MatDrawer;
  @ViewChild("stepper") private myStepper: MatStepper;
  dialogTitle: string;
  id: string;
  initForm: UntypedFormGroup;
  labelButton: string;
  suffixe: string = " une personne affectée";
  nrSelect;
  situationsMatrimoniales: any;
  typeIdentifications: any = [];
  capaciteJuridiques: any;
  dateDelivrance;
  regimeMatrimoniaux: any;
  professions: any;
  loader: boolean;
  action: string;
  minBirthDay: any;
  today = new Date();
  fields: any;
  canAdd: boolean;
  dataCheck;
  url = "databasePapPlaceAffaire";
  hasPhoneError: boolean;
  currentValue: any;
  countryChange: boolean = false;
  eventNumber: any;
  isFocus: unknown;
  errorCNI;
  newDate = new Date();
  emailPattern =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  isValidOnWhatsApp: boolean = true;
  ng2TelOptions;
  idPiece;
  listeNoire: boolean = false;
  currentUser: any;

  urlImage = environment.apiUrl + "image/getFile/";

  uploadedImage!: File;

  constructor(
    public matDialogRef: MatDialogRef<AddPapPlaceAffaireComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private changeDetectorRefs: ChangeDetectorRef,
    private localService: LocalService,
    private clientServive: ClientVueService,
  ) {
    this.currentUser=this.localService.getDataJson("user");

    console.log("user connecter",this.currentUser)
    console.log("==data fomrmr==================================");
    console.log(_data.data.pays);
    console.log("====================================");
    if (_data?.action == "new") {
      this.initForms();
      this.labelButton = "Ajouter ";
    } else if (_data?.action == "edit") {
      this.labelButton = "Modifier ";
      this.id = _data.data.id;
      this.initForms(_data.data);
      console.log(_data.data);
        this.initForm.get("sexe").setValue(_data.data.sexe);
      const selectedCountry = _data.data.pays;

    }
    this.action = _data?.action;
    this.canAdd = _data.canAdd;
    this.dialogTitle = this.labelButton + this.suffixe;
    this.ng2TelOptions = { initialCountry: "sn" };


  }


  checkValidOnWhatsApp(event: any): void {
    const value = event.value;
    this.initForm.get("statutVulnerable")?.setValue(value);
  }



  goToStep(index) {
    this.myStepper.selectedIndex = index;
  }

  initForms(donnees?) {
    this.initForm = this.fb.group({
      codePap: this.fb.control(donnees ? donnees.codePap : null, [
        Validators.required,
      ]),
      caracteristiquePlaceAffaire: this.fb.control(
        donnees ? donnees.caracteristiquePlaceAffaire : null,
        []
      ),
      evaluationPerte: this.fb.control(
        donnees ? donnees.evaluationPerte : null,
        []
      ),
      nom: this.fb.control(donnees ? donnees.nom : null, [Validators.required]),
      prenom: this.fb.control(donnees ? donnees.prenom : null, [
        Validators.required,
      ]),
      codePlaceAffaire: this.fb.control(
        donnees ? donnees.codePlaceAffaire : null,
        [Validators.required]
      ),
      commune: this.fb.control(donnees ? donnees.commune : null, [

      ]),
      departement: this.fb.control(donnees ? donnees.departement : null, [

      ]),
      nombrePlaceAffaire: this.fb.control(
        donnees ? donnees.nombrePlaceAffaire : null,
        []
      ),
      surnom: this.fb.control(donnees ? donnees.surnom : null),
      sexe: this.fb.control(donnees ? donnees.sexe : null, []),
      existePni: this.fb.control(donnees ? donnees.existePni : null),
      typePni: this.fb.control(donnees ? donnees.typePni : null),
      numeroPni: this.fb.control(donnees ? donnees.numeroPni : null),
      numeroTelephone: this.fb.control(
        donnees ? donnees.numeroTelephone : null,
        []
      ),
      photoPap: this.fb.control(donnees ? donnees.photoPap : null),
      pointGeometriques: this.fb.control(
        donnees ? donnees.pointGeometriques : null
      ),
      superficie: this.fb.control(donnees ? donnees.superficie : null),
      nationalite: this.fb.control(donnees ? donnees.nationalite : null, [
        ,
      ]),
      ethnie: this.fb.control(donnees ? donnees.ethnie : null),
      langueParlee: this.fb.control(donnees ? donnees.langueParlee : null),
      situationMatrimoniale: this.fb.control(
        donnees ? donnees.situationMatrimoniale : null,
        []
      ),
      niveauEtude: this.fb.control(donnees ? donnees.niveauEtude : null),
      religion: this.fb.control(donnees ? donnees.religion : null),
      membreFoyer: this.fb.control(donnees ? donnees.membreFoyer : null),
      membreFoyerHandicape: this.fb.control(
        donnees ? donnees.membreFoyerHandicape : null
      ),
      informationsEtendues: this.fb.control(
        donnees ? donnees.informationsEtendues : null
      ),
      pj1: this.fb.control(donnees ? donnees.pj1 : null),
      pj2: this.fb.control(donnees ? donnees.pj2 : null),
      pj3: this.fb.control(donnees ? donnees.pj3 : null),
      pj4: this.fb.control(donnees ? donnees.pj4 : null),
      pj5: this.fb.control(donnees ? donnees.pj5 : null),
      statutPap: this.fb.control(donnees ? donnees.statutPap : null, [

      ]),
      vulnerabilite: this.fb.control(donnees ? donnees.vulnerabilite : null),
      infos_complemenataires: this.fb.control(
        donnees ? donnees.infos_complemenataires : null
      ),
      projectId: this.fb.control(this.currentUser.projects ? this.currentUser.projects[0]?.id   : null, [
        Validators.required,
      ]),
    });
  }






  checkValidity(g: UntypedFormGroup) {
    Object.keys(g.controls).forEach((key) => {
      g.get(key).markAsDirty();
    });
    Object.keys(g.controls).forEach((key) => {
      g.get(key).markAsTouched();
    });
    Object.keys(g.controls).forEach((key) => {
      g.get(key).updateValueAndValidity();
    });
  }



  addItems() {
    // if(this.listeNoire){
    console.log("====================================");
    console.log(this.initForm.value);
    console.log("====================================");
    this.snackbar
      .showConfirmation("Voulez-vous vraiment ajouter ce pap ?")
      .then((result) => {
        if (result["value"] == true) {
          this.loader = true;
          const value = this.initForm.value;
          this.coreService.addItem([value], this.url).subscribe(
            (resp) => {
              if (resp["responseCode"] == 201) {
                this.snackbar.openSnackBar("Pap  ajoutée avec succés", "OK", [
                  "mycssSnackbarGreen",
                ]);
                this.loader = false;
                this.matDialogRef.close(resp["data"]);
                this.changeDetectorRefs.markForCheck();
              } else {
                this.loader = false;
                this.changeDetectorRefs.markForCheck();
              }
            },
            (error) => {
              console.log(error);

              this.loader = false;
              this.changeDetectorRefs.markForCheck();
              this.snackbar.showErrors(error.message);
            }
          );
        }
      });
    // }else if(!this.listeNoire){
    //
    // }
  }

  updateItems() {
    console.log("====================================");
    console.log(this.initForm.value);
    console.log("====================================");
    this.snackbar
      .showConfirmation(
        "Voulez-vous vraiment modifier cette personne affectée ?"
      )
      .then((result) => {
        if (result["value"] == true) {
          this.loader = true;
          const value = this.initForm.value;
          this.coreService.updateItem(value, this.id, this.url).subscribe(
            (resp) => {
              if (resp) {
                this.loader = false;
                this.matDialogRef.close(resp);
                this.snackbar.openSnackBar(
                  "Personne affectée modifiée avec succés",
                  "OK",
                  ["mycssSnackbarGreen"]
                );
              } else {
                this.loader = false;
                this.snackbar.openSnackBar(resp["message"], "OK", [
                  "mycssSnackbarRed",
                ]);
              }
            },
            (error) => {
              this.loader = false;
              this.loader = false;
              this.snackbar.showErrors(error);
            }
          );
        }
      });
  }

  checkRecap(type) {
    if (type == "new") {
      this.addItems();
    } else if (type == "edit") {
      this.updateItems();
    }
  }


  selectOnFile(evt, type, name) {
    let accept = [];
    let extension = "";
    if (type === "photo_profile") {
      accept = [".png", ".PNG", ".jpg", ".JPG"];
      extension = "une image";
    }
    for (const file of evt.target.files) {
      const index = file.name.lastIndexOf(".");
      const strsubstring = file.name.substring(index, file.name.length);
      const ext = strsubstring;
      if (accept.indexOf(strsubstring) === -1) {
        this.snackbar.openSnackBar(
          "Ce fichier " + file.name + " n'est " + extension,
          "OK",
          ["mycssSnackbarRed"]
        );
        return;
      } else {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (type === "photo_profile") {
            const img = new Image();
            img.src = e.target.result;
            this.saveStoreFile(file);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  imageToff: any;

  saveStoreFile(file) {
    let formData = new FormData();
    formData.append("file", file);
    this.changeDetectorRefs.detectChanges();
    const dataFile = { file: file };
    this.clientServive
      .saveStoreFile("image/uploadFileDossier", formData)
      .subscribe(
        (resp) => {
          if (resp) {
            console.log(resp);
            this.imageToff = `${this.urlImage + resp["data"]}`;
            this.initForm.get("photoPap").setValue(this.imageToff);
          }
        },
        (error) => {
          console.log(error);
          this.snackbar.showErrors(error);
        }
      );
  }

}
