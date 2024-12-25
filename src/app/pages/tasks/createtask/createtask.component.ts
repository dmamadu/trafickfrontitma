import {
  Component,
  OnInit,
  ViewChild,
  EventEmitter,
  Output,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
  CUSTOM_ELEMENTS_SCHEMA,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";

import * as ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {provideNativeDateAdapter} from '@angular/material/core';
import { selectData } from "src/app/store/Tasks/tasks-selector";
import { memberList } from "src/app/core/data";

import { Store } from "@ngrx/store";
import { Mo, ResponseData } from "../../projects/project.model";
import { ProjectService } from "src/app/core/services/project.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { CoreService } from "src/app/shared/core/core.service";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { LocalService } from "src/app/core/services/local.service";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatOptionModule, MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { NgApexchartsModule } from "ng-apexcharts";
import { DndModule } from "ngx-drag-drop";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { UIModule } from "src/app/shared/ui/ui.module";

@Component({
  selector: "app-createtask",
  templateUrl: "./createtask.component.html",
  standalone: true,
  imports: [
    UIModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UIModule,
    NgApexchartsModule,
    CKEditorModule,
    DndModule,
    AngularMaterialModule,
    MatDialogModule,
    MatSelectModule,
    MatOptionModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
  ],
  styleUrls: ["./createtask.component.scss"],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

/**
 * Tasks-create component
 */
export class CreatetaskComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;
  dialogTitle: string = "";
  public Editor = ClassicEditor;
  form = new UntypedFormGroup({
    member: new UntypedFormArray([new UntypedFormControl("")]),
  });
  loader: boolean;
  hidden: boolean;
  selected: any;
  initForm: UntypedFormGroup;
  id: string;
  action = "";
  labelButton: string = "Créer une tache";
  url = "taches";
  @Input() fromDate: Date;
  @Input() toDate: Date;
  @Output() dateRangeSelected: EventEmitter<{}> = new EventEmitter();
  memberLists: any;
  tacheToUpdate: any = null;

  @ViewChild("dp", { static: true }) datePicker: any;

  /**
   * Returns the form field value
   */
  get member(): UntypedFormArray {
    return this.form.get("member") as UntypedFormArray;
  }
  /**
   * Add the member field in form
   */
  addMember() {
    this.member.push(new UntypedFormControl());
  }
  /**
   * Onclick delete member from form
   */
  deleteMember(i: number) {
    this.member.removeAt(i);
  }
  listMo: Mo[] = [];

  usersToUpdate: any = [];
  ngOnInit() {
    this.fetchMo();
    this.breadCrumbItems = [
      { label: "Taches" },
      { label: "Création d'une tache", active: true },
    ];
    this.hidden = true;
    this.store.select(selectData).subscribe((data) => {
      this.memberLists = memberList;
    });
  }

  constructor(
    public matDialogRef: MatDialogRef<CreatetaskComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    public store: Store,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private changeDetectorRefs: ChangeDetectorRef,
    private localService: LocalService,
    private _router: Router
  ) {
    // this.action = "new";
    if (_data?.action == "new") {
      this.initForms();
      this.labelButton = "Ajouter ";
      this.dialogTitle="Créer une tache"
    } else if (_data?.action == "edit") {
      this.labelButton = "Modifier ";
      this.id = _data.data.id;
      this;this.dialogTitle="Modifier une tache"
      this.initForms(_data.data);
    }
  }

  initForms(donnees?) {
    this.initForm = this.fb.group({
      libelle: this.fb.control(donnees ? donnees?.libelle : null, [
        Validators.required,
      ]),
      description: this.fb.control(donnees ? donnees?.description : null, [
        Validators.required,
      ]),
      dateDebut: this.fb.control(donnees ? donnees?.dateDebut : null, [
        Validators.required,
      ]),
      dateFin: this.fb.control(donnees ? donnees?.dateFin : null, [
        Validators.required,
      ]),
      statut: this.fb.control(donnees ? donnees?.statut : null, [
        Validators.required,
      ]),
      utilisateurs: this.fb.array([]),
    });
  }

  get assignListFormArray(): FormArray {
    return this.initForm.get("utilisateurs") as FormArray;
  }
  assignList: any = [];
  slectMember(id: number) {
    if (this.listMo[id].checked === "0") {
      this.listMo[id].checked = "1";
      this.assignList.push(this.listMo[id]);
      console.log("====================================");
      console.log("push", this.assignList);
      console.log("====================================");
      this.assignListFormArray.push(this.fb.control(this.listMo[id]));
    } else {
      this.listMo[id].checked = "0";
      const index = this.assignList.findIndex(
        (member) => member.id === this.listMo[id].id
      );
      if (index !== -1) {
        this.assignList.splice(index, 1);
        this.assignListFormArray.removeAt(index);
      }
    }
  }

  fetchMo(): void {
    this.projectService
      .all<ResponseData<any[]>>("users/by_role?roleName=Consultant")
      .subscribe((response: ResponseData<any[]>) => {
        console.log(response);
        if (this.tacheToUpdate !== null) {
          this.usersToUpdate = this.tacheToUpdate.utilisateurs;
        }

        this.listMo = response.data.map((user) => {
          const isUserToUpdate = this.usersToUpdate.some(
            (updateUser) => updateUser.id === user.id
          );
          return {
            ...user,
            checked: isUserToUpdate ? "1" : "0",
          };
        });

        this.listMo.forEach((user) => {
          if (user.checked === "1") {
            this.assignListFormArray.push(this.fb.control(user));
          }
        });

        console.log(this.listMo);
      });
  }

  myImage: string;
  getImageFromBase64(imageType: string, imageName: number[]): string {
    const base64Representation = "data:" + imageType + ";base64," + imageName;
    return base64Representation;
  }

  save() {
    console.log(this.initForm.value);
  }

  addItems() {
    console.log("====================================");
    console.log(this.initForm.value);
    console.log("====================================");
    this.snackbar
      .showConfirmation("Voulez-vous vraiment créé cette tache ?")
      .then((result) => {
        if (result["value"] == true) {
          this.loader = true;
          const value = this.initForm.value;
          this.coreService.addItem(value, this.url).subscribe(
            (resp) => {
              if (resp["responseCode"] == 200) {
                this.snackbar.openSnackBar("Tache  ajoutée avec succés", "OK", [
                  "mycssSnackbarGreen",
                ]);
                this.loader = false;
                this._router.navigate(["tasks/liste"])
              } else {
                this.loader = false;
                this.changeDetectorRefs.markForCheck();
              }
            },
            (error) => {
              this.loader = false;
              this.changeDetectorRefs.markForCheck();
              this.snackbar.showErrors(error);
            }
          );
        }
      });
  }

  checkRecap(type) {
    console.log(type);
    if (type == "new") {
      this.addItems();
    } else if (type == "edit") {
      this.updateItems();
    }
  }

  updateItems() {
    console.log(this.initForm.value, this.id);
    this.snackbar
      .showConfirmation(`Voulez-vous vraiment modifier cette tache `)
      .then((result) => {
        if (result["value"] == true) {
          this.loader = true;
          const value = this.initForm.value;
          this.coreService.updateItem(value, this.id, this.url).subscribe(
            (resp) => {
              if (resp) {
                this.loader = false;
                //   this.matDialogRef.close(resp);
                this.snackbar.openSnackBar(
                  "Consultant  modifié avec succés",
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

  annuler() {
    this.initForm.reset();
  }
}
