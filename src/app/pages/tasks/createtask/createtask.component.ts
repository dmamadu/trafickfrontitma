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
import { provideNativeDateAdapter } from "@angular/material/core";
import { DropzoneConfigInterface } from "ngx-dropzone-wrapper";

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
import { BsDropdownModule } from "ngx-bootstrap/dropdown";

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
    BsDropdownModule,
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
  loader: boolean = false;
  hidden: boolean;
  selected: any;
  initForm: UntypedFormGroup;
  id: string;
  action = "";
  labelButton: string = "Créer une tache";
  url = "taches";
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
  }
  currentProjectId: any;

  constructor(
    public matDialogRef: MatDialogRef<CreatetaskComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    public store: Store,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private coreService: CoreService,
    private localService: LocalService,
    private snackbar: SnackBarService,
    private changeDetectorRefs: ChangeDetectorRef
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");

    this.action = _data.action;
    if (_data?.action == "new") {
      this.initForms();
      this.labelButton = "Ajouter ";
      this.dialogTitle = "Créer une tache";
    } else if (_data?.action == "edit") {
      this.labelButton = "Modifier ";
      this.id = _data.data.id;
      this;
      this.dialogTitle = "Modifier une tache";
      this.initForms(_data.data);
    }
  }

  // initForms(donnees?) {
  //   this.initForm = this.fb.group({
  //     libelle: this.fb.control(donnees ? donnees?.libelle : null, [
  //       Validators.required,
  //     ]),
  //     description: this.fb.control(donnees ? donnees?.description : null, [
  //       Validators.required,
  //     ]),
  //     dateDebut: this.fb.control(donnees ? donnees?.dateDebut : null, [
  //       Validators.required,
  //     ]),
  //     dateFin: this.fb.control(donnees ? donnees?.dateFin : null, [
  //       Validators.required,
  //     ]),
  //     statut: this.fb.control(donnees ? donnees?.statut : null, [
  //       Validators.required,
  //     ]),
  //     utilisateurs: this.fb.array([]),
  //   });
  // }

  initForms(donnees?: any) {
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

    if (donnees && donnees.utilisateurs) {
      this.tacheToUpdate = donnees;
      this.usersToUpdate = donnees.utilisateurs;
    }
    this.fetchMo();
  }
  get assignListFormArray(): FormArray {
    return this.initForm.get("utilisateurs") as FormArray;
  }
  assignList: any = [];
  slectMember(id: number) {
    if (this.listMo[id].checked === "0") {
      this.listMo[id].checked = "1";
      this.assignList.push(this.listMo[id]);
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

  // fetchMo(): void {
  //   this.projectService
  //     .all<ResponseData<any[]>>("users/all")
  //     .subscribe((response: ResponseData<any[]>) => {
  //       console.log(response);
  //       if (this.tacheToUpdate !== null) {
  //         this.usersToUpdate = this.tacheToUpdate.utilisateurs;
  //       }

  //       this.listMo = response.data.map((user) => {
  //         const isUserToUpdate = this.usersToUpdate.some(
  //           (updateUser) => updateUser.id === user.id
  //         );
  //         return {
  //           ...user,
  //           checked: isUserToUpdate ? "1" : "0",
  //         };
  //       });

  //       this.listMo.forEach((user) => {
  //         if (user.checked === "1") {
  //           this.assignListFormArray.push(this.fb.control(user));
  //         }
  //       });

  //       console.log(this.listMo);
  //     });
  // }
  fetchMo(): void {
    this.projectService
      .all<ResponseData<any[]>>("users/all")
      .subscribe((response: ResponseData<any[]>) => {
        this.listMo = response.data.map((user) => {
          this.changeDetectorRefs.detectChanges();
          const isAssigned =
            this.usersToUpdate?.some((u) => u.id === user.id) ||
            this.assignList.some((a) => a.id === user.id);
          return {
            ...user,
            checked: isAssigned ? "1" : "0",
          };
        });

        // Ajoute les utilisateurs assignés au FormArray
        if (this.usersToUpdate) {
          this.usersToUpdate.forEach((user) => {
            if (!this.assignList.some((a) => a.id === user.id)) {
              this.assignList.push(user);
              this.assignListFormArray.push(this.fb.control(user));
            }
          });
        }
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
    if (this.initForm.valid) {
      this.snackbar
        .showConfirmation("Voulez-vous vraiment créé cette tache ?")
        .then((result) => {
          if (result["value"] == true) {
            this.loader = true;
            const value = this.initForm.value;
            this.coreService
              .addItemWithProject(value, this.url, +this.currentProjectId)
              .subscribe(
                (resp) => {
                  console.log("====================================");
                  console.log(resp);
                  console.log("====================================");
                  if (resp["responseCode"] == 200) {
                    this.snackbar.openSnackBar(
                      "Tache  ajoutée avec succés",
                      "OK",
                      ["mycssSnackbarGreen"]
                    );
                    this.matDialogRef.close(resp["data"]);
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
    } else {
    }
  }

  checkRecap(type) {
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
                this.snackbar.openSnackBar(
                  "Consultant  modifié avec succés",
                  "OK",
                  ["mycssSnackbarGreen"]
                );
                this.matDialogRef.close(resp["data"]);
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

  // Ajoutez ces nouvelles propriétés
  userSearchText: string = "";
  filteredUsers: any[] = [];

  // Modifiez fetchMo()
  // fetchMo(): void {
  //   this.projectService.all<ResponseData<any[]>>("users/all").subscribe((response: ResponseData<any[]>) => {
  //     this.listMo = response.data;
  //     this.filteredUsers = [...this.listMo];

  //     // Pré-sélection des utilisateurs existants
  //     if (this.tacheToUpdate?.utilisateurs) {
  //       this.tacheToUpdate.utilisateurs.forEach(user => {
  //         if (!this.assignList.some(u => u.id === user.id)) {
  //           this.assignList.push(user);
  //           this.assignListFormArray.push(this.fb.control(user));
  //         }
  //       });
  //     }
  //   });
  // }

  // Nouvelle méthode de filtrage
  filterUsers(): void {
    if (!this.userSearchText) {
      this.filteredUsers = [...this.listMo];
      return;
    }

    const searchText = this.userSearchText.toLowerCase();
    this.filteredUsers = this.listMo.filter(
      (user) =>
        user.lastname.toLowerCase().includes(searchText) ||
        user.firstname.toLowerCase().includes(searchText)
    );
  }

  // Méthode pour vérifier la sélection
  isSelected(user: any): boolean {
    return this.assignList.some((u) => u.id === user.id);
  }

  // Méthode pour basculer la sélection
  toggleUserSelection(user: any): void {
    if (this.isSelected(user)) {
      this.removeAssignee(user);
    } else {
      this.assignList.push(user);
      this.assignListFormArray.push(this.fb.control(user));
    }
  }

  // Méthode pour supprimer un assigné
  removeAssignee(user: any): void {
    const index = this.assignList.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      this.assignList.splice(index, 1);
      this.assignListFormArray.removeAt(index);
    }
  }
}
