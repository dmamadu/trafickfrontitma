import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
} from "@angular/core";
import {
  FormArray,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { LocalService } from "src/app/core/services/local.service";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { SignatureComponent } from "../signature/signature.component";

@Component({
  selector: "app-add-entente",
  standalone: true,
  imports: [CommonModule, AngularMaterialModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: "fr-FR" },
    { provide: MatPaginatorIntl },
    SnackBarService,
    MatDatepickerModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./add-entente.component.html",
  styleUrl: "./add-entente.component.css",
})
export class AddEntenteComponent implements OnInit {
  initForm: UntypedFormGroup;
  dialogRef: any;
  form: FormGroup;
  currentUser: any;
  constructor(
    public matDialogRef: MatDialogRef<AddEntenteComponent>,
    private _matDialog: MatDialog,
    private fb: UntypedFormBuilder,
    private localService: LocalService,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.currentUser = this.localService.getDataJson("user");
    this.initForms();
  }
  ngOnInit(): void {
    this.form = this.fb.group({
      articles: this.fb.array([]),
    });
  }

  initForms(donnees?) {
    this.initForm = this.fb.group({
      libelleProjet: this.fb.control(donnees ? donnees?.prenom : null, [
        Validators.required,
      ]),
      codePap: this.fb.control(donnees ? donnees?.prenom : null, [
        Validators.required,
      ]),
      prenom: this.fb.control(donnees ? donnees?.prenom : null, [
        Validators.required,
      ]),
      nom: this.fb.control(donnees ? donnees?.nom : null, [
        Validators.required,
      ]),
      dateNaissance: this.fb.control(donnees ? donnees?.dateNaissance : null, [
        Validators.required,
      ]),
      lieuNaissance: this.fb.control(donnees ? donnees?.lieuNaissance : null, [
        Validators.required,
      ]),
      typeIdentification: this.fb.control(
        donnees ? donnees?.typeIdentification : null,
        [Validators.required]
      ),
      numeroIdentification: this.fb.control(
        donnees ? donnees?.numeroIdentification : null,
        [Validators.required]
      ),
      localiteEnregistrement: this.fb.control(
        donnees ? donnees?.localite : null,
        [Validators.required]
      ),
      dateEnregistrement: this.fb.control(donnees ? donnees?.localite : null, [
        Validators.required,
      ]),
      urlSignaturePap: this.fb.control(donnees ? donnees?.urlSignaturePap : null, [
        Validators.required,
      ]),
      urlSignatureResponsable: this.fb.control(donnees ? donnees?.urlSignatureResponsable : null, [
        Validators.required,
      ]),
      // project_id: this.fb.control(this.currentUser.projects ? this.currentUser.projects[0]?.id   : null, [
      //   Validators.required,
      // ]),
      projectId: this.fb.control(
        this.currentUser.projects ? this.currentUser.projects[0]?.id : null,
        [Validators.required]
      ),
      articles: this.fb.array([]),
    });
  }

  get articles(): FormArray {
    return this.form.get("articles") as FormArray;
  }

  addMember(memberData?: any) {
    if (this.articles.length > 0) {
      const lastMember = this.articles.at(this.articles.length - 1);
      if (!lastMember.valid) {
        console.log("The last member is invalid. Cannot add a new member.");
        return;
      }
    }

    const memberForm = this.fb.group({
      titre: [memberData ? memberData.titre : "", [Validators.required]],
      description: [
        memberData ? memberData.description : "",
        [Validators.required],
      ],
    });

    this.articles.push(memberForm);
  }

  deleteMember(i: number) {
    this.articles.removeAt(i);
  }

  addEntente() {
    const articlesFromForm = this.form.get("articles").value;
    if (Array.isArray(articlesFromForm)) {
      this.initForm.setControl("articles", this.fb.array(articlesFromForm));
    }
    this.snackbar
      .showConfirmation(`Voulez-vous vraiment ajouter cet entente `)
      .then((result) => {
        if (result["value"] == true) {
          this.coreService
            .addItem(this.initForm.value, "entente_compensations")
            .subscribe(
              (resp) => {
                if (resp["responseCode"] == 200) {
                  this.snackbar.openSnackBar(
                    "Entente  ajouté avec succés",
                    "OK",
                    ["mycssSnackbarGreen"]
                  );
                  this._changeDetectorRef.markForCheck();
                  this.matDialogRef.close();
                } else {
                  this._changeDetectorRef.markForCheck();
                }
              },
              (error) => {
                this._changeDetectorRef.markForCheck();
                this.snackbar.showErrors(error);
              }
            );
        }
      });
  }

  signatureClient(val:string): void {
    this.dialogRef = this._matDialog.open(SignatureComponent, {
      autoFocus: true,
      width: "35rem",
      panelClass: "event-form-dialog",
      disableClose: true,
      data: {
        action: "new",
       // pap: this.infosPap,
      },
    });
    // this.dialogRef.afterClosed().subscribe((resp) => {
    // // this.getClient(this.paramsId);
    // if (signatureUrl) {

    //   this.initForm.get('urlSignaturePap').setValue(signatureUrl);
    // }
    // });
    this.dialogRef.afterClosed().subscribe((signatureUrl) => {
      if (signatureUrl) {
        this.initForm.get(val).setValue(signatureUrl);
      }
    });
  }
}
