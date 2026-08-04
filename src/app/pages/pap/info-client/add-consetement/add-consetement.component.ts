import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { CoreService } from "src/app/shared/core/core.service";
import { LocalService } from "src/app/core/services/local.service";
import { CONSTANTES } from "src/app/shared/models/constantes";
import { models } from "src/app/shared/models/model";
import { TemplateConsentementComponent } from "../template-consentement/template-consentement.component";
import * as ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-add-consetement",
  standalone: true,
  imports: [
    AngularMaterialModule,
    CKEditorModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./add-consetement.component.html",
  styleUrl: "./add-consetement.component.css",
})
export class AddConsetementComponent implements OnInit {
  public Editor = ClassicEditor;

  @ViewChild("productionHebdo", { static: false })
  public productionHebdo: ElementRef;
  dialogTitle: string;
  loader: boolean;
  isLoading: boolean = false;
  action: string;
  canAdd: boolean;
  constantes = CONSTANTES;
  fields: any;
  labelButton;
  dialogRef: any;
  templateSrc: any;
  isLoader: boolean = false;
  initForm: UntypedFormGroup;
  logoInstitution;
  infos: any;
  lienBrute: any;
  constructor(
    public matDialogRef: MatDialogRef<TemplateConsentementComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    private coreService: CoreService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private snackbar: SnackBarService,
    private localService: LocalService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    //@ts-ignore
    this.lienBrute = this.route.snapshot._routerState.url;
    console.log(_data);
    this.infos = _data;
    const lien = this.lienBrute.substring(1, this.lienBrute.length);
    const currentLag = "fr";
    //this.infos = models[lien + "-" + currentLag];
    this.fields = _data.client;
    this.templateSrc = _data.templateClient;
    this.dialogTitle = "Lettre de consentement";
    this.logoInstitution = "assets/images/logo_itma_png.png";
    this.initForms();
  }
  ngOnInit(): void {}
  initForms() {
    return (this.initForm = this.formBuilder.group({
      contenu: ["", [Validators.required]],
    }));
  }

  captureScreen(autoPrint = false) {}

  ajoutConstemment() {
    let data = {
      contenu: this.initForm.value.contenu,
      partie_affecte_id: this.infos.pap.id,
    };
    this.snackbar
      .showConfirmation("Voulez-vous ajouter cet attribut complémentaire ?")
      .then((result) => {
        if (result["value"] == true) {
          this.isLoading = true;
          //const data = this.initForm;
          this.coreService
            .addItemWithProject(data, "lettres_consentement", this.localService.getData("ProjectId"))
            .subscribe(
              (resp) => {
                if (
                  resp['status'] ==200
                ) {
                  this.snackbar.openSnackBar(
                    "Lettre de consentement ajouté avec succés",
                    "OK",
                    ["mycssSnackbarGreen"]
                  );
                  this.isLoading = false;
                  this.matDialogRef.close(resp);
                  this._changeDetectorRef.markForCheck();
                } else {
                  this.isLoading = false;
                }
              },
              (error) => {
                console.log(error);
                this.isLoading = false;
              }
            );
        }
      });
  }
}
