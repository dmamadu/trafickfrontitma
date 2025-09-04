import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  ViewChild,
  Output,
  ChangeDetectorRef,
  Inject,
  inject,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { ProjectService } from "src/app/core/services/project.service";
import { Mo, NormeProject, Project } from "src/app/shared/models/Projet.model";
import { ResponseData } from "src/app/shared/models/Projet.model";
import { ToastrService } from "ngx-toastr";
import { Image } from "src/app/shared/models/image.model";
import { Router } from "@angular/router";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ClientVueService } from "../../admin/client-vue/client-vue.service";
import { environment } from "src/environments/environment";
import { AddMaitreOuvrageComponent } from "../../maitrouvrages/add-maitre-ouvrage/add-maitre-ouvrage.component";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { ImageModalComponent } from "src/app/shared/image-modal.component";
import { CommonModule, DatePipe } from "@angular/common";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { ColorPickerModule } from "ngx-color-picker";
import { FlatpickrModule } from "angularx-flatpickr";
import { UIModule } from "src/app/shared/ui/ui.module";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { NgApexchartsModule } from "ng-apexcharts";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { LoaderComponent } from "../../../shared/loader/loader.component";
import { LocalService } from "src/app/core/services/local.service";

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: "DD/MM/YYYY",
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MMMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@Component({
  selector: "app-add",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    ColorPickerModule,
    FlatpickrModule,
    FlatpickrModule,
    CommonModule,
    UIModule,
    BsDropdownModule,
    TooltipModule,
    NgApexchartsModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatNativeDateModule,
    LoaderComponent
],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: "./add.component.html",
  styleUrl: "./add.component.css",
})
export class AddComponent {
  imageToff: any;
  listProject: Project[];
  urlImage = environment.apiUrl + "fileMinios/download/";
  isloading: boolean = false;
  buttonText: string = "";
  textHead: string = "";
      userId:string;

      private localService = inject(LocalService);
  
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private projectService: ProjectService,
    public toastr: ToastrService,
    private router: Router,
    private snackbar: SnackBarService,
    private clientServive: ClientVueService,
    private _changeDetectorRef: ChangeDetectorRef,
    public matDialogRef: MatDialogRef<AddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {



 this.localService.getDataJson("user");


 this.userId=this.localService.getDataJson("user").id;

console.log(this.userId);

    this.initializeForm();
    if (data && data.action == "edit") {
      this.buttonText = "Modifier";
      this.textHead = "Modification du projet";
      this.populateForm(data.data);
    } else {
      this.buttonText = "Créer";
      this.textHead = "Création du projet";
    }
  }

  private initializeForm(): void {
    this.projectForm = this.fb.group({
      id: [],
      libelle: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
        ],
      ],
      status: ["", Validators.required],
      description: [
        "",
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(500),
        ],
      ],
      imageUrl: ["", [Validators.required, Validators.maxLength(500)]],
      datedebut: ["", Validators.required],
      datefin: ["", Validators.required],
      users: this.fb.array([]),
      primaryColor: ["#3F51B5", [Validators.required]],
      secondaryColor: ["#FF4081", [Validators.required]],
      accentColor: ["#4CAF50", [Validators.required]],
    });

    this.form = this.fb.group({
      members: this.fb.array([]),
    });
  }

  private populateForm(project: any): void {
    this.projectForm.patchValue({
      id: project.id,
      libelle: project.libelle,
      status: project.status,
      description: project.description,
      imageUrl: project.imageUrl,
      datedebut: project.datedebut ? new Date(project.datedebut) : null,
      datefin: project.datefin ? new Date(project.datefin) : null,
    });

    // Remplir les couleurs
    if (project.colors) {
      try {
        const colors = JSON.parse(project.colors);
        this.projectForm.patchValue({
          primaryColor: colors.primary,
          secondaryColor: colors.secondary,
          accentColor: colors.accent,
        });
      } catch (e) {
        console.error("Error parsing colors", e);
      }
    }

    // Remplir les utilisateurs assignés
    if (project.users && project.users.length > 0) {
      // const userFormArray = this.projectForm.get("users") as FormArray;
      // userFormArray.clear(); // Nettoyer avant de remplir

      // project.users.forEach((user) => {
      //   userFormArray.push(this.fb.control(user));
      //   const index = this.listMo.findIndex((mo) => mo.id === user.id);
      //   if (index !== -1) {
      //     this.listMo[index].checked = "1";
      //     this.assignList.push(this.listMo[index]);
      //   }
      // });

      if (project.users) {
        this.usersToUpdate = project.users;
      }
    }

    setTimeout(() => {
      if (project.normes && project.normes.length > 0) {
        this.members.clear(); // Nettoyer avant de remplir
        project.normes.forEach((norme) => {
          this.addMember(norme);
        });
      }
    });
    if (project.imageUrl) {
      this.imageProjet = project.imageUrl;
    }
  }
  get assignListFormArray(): FormArray {
    return this.projectForm.get("users") as FormArray;
  }

  get f() {
    return this.projectForm.controls;
  }
  // bread crumb items
  assignMember: any;
  projectForm: FormGroup;

  form: FormGroup;
  dropdownSettings = {};
  ngOnInit() {
    this.fetchMo();
    this.assignMember = this.listMo;
    this.form = this.fb.group({
      members: this.fb.array([]),
    });
  }
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

  removeAssignee(user: any): void {
    const index = this.assignList.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      this.assignList.splice(index, 1);
      this.assignListFormArray.removeAt(index);
    }
  }
  // File Upload
  imageURL: any;

  assignList: any = [];
  slectMember(id: number) {
    if (!this.listMo || id < 0 || id >= this.listMo.length) {
      console.error("Index invalide ou listMo non défini");
      return;
    }
    const member = this.listMo[id];
    if (!member || member.checked == undefined) {
      console.error("Membre non trouvé ou propriété checked manquante");
      return;
    }
    member.checked = member.checked || "0";
    if (member.checked == "0") {
      member.checked = "1";
      this.assignList.push(member);
      this.assignListFormArray.push(this.fb.control(member));
    } else {
      member.checked = "0";
      const index = this.assignList.findIndex((m) => m.id === member.id);
      if (index !== -1) {
        this.assignList.splice(index, 1);
        this.assignListFormArray.removeAt(index);
      }
    }
  }

  // create() {
  //   return this.projectService
  //     .add<ResponseData<Project>>(
  //       "projects/createProject",
  //       this.projectForm.value
  //     )
  //     .subscribe((data: ResponseData<Project>) => {
  //       this.toastr.success(`${data.message}`);
  //       this.projectForm.reset();
  //     });
  // }

  uploadedImage!: File;
  toff: any;

  imagePath: any;
  newProject: Project;
  newIdCat!: number;

  get members(): FormArray {
    if (!this.form) {
      this.form = this.fb.group({
        members: this.fb.array([]),
      });
    }
    return this.form.get("members") as FormArray;
  }

  save() {
    if (this.projectForm.invalid) {
      this.toastr.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (this.buttonText == "Modifier le projet") {
      this.updateProject(this.projectForm.value);
    } else {
      this.createProject(this.projectForm.value);
    }
  }

  // addProject() {
  //   this.createProject(this.projectForm.value);
  // }

  createProject(projectRequest: any): void {
    this.projectForm.markAllAsTouched();
    if (this.projectForm.valid) {
      this.isloading = true;
      const colors = {
        primary: this.projectForm.value.primaryColor,
        secondary: this.projectForm.value.secondaryColor,
        accent: this.projectForm.value.accentColor,
      };
      const normeProject: NormeProject[] = this.members.value;
      projectRequest.normes = normeProject;

      projectRequest.colors = JSON.stringify(colors);
      delete projectRequest.primaryColor;
      delete projectRequest.secondaryColor;
      delete projectRequest.accentColor;
      this.snackbar
        .showConfirmation("Voulez-vous vraiment créer le projet ?")
        .then((result) => {
          if (result["value"] == true) {
            this.projectService
              .add<ResponseData<Project>>(
                `projects/createProject/${this.userId}`,
                projectRequest
              )
              .subscribe(
                (data: ResponseData<Project>) => {
                  console.log("Project created successfully:", data);
                  this.toastr.success(`${data.message}`);
                  this.matDialogRef.close(true);
                  //    this.router.navigate(["/projects/list"]);
                  this.toastr.success(`Projet créé avec succès`);
                  this.isloading = false;
                },
                (error) => {
                  console.error("Error creating project:", error);
                  this.toastr.error(`Une erreur s'est produite`);
                  this.matDialogRef.close(true);
                  this.isloading = false;
                }
              );
          } else {
            this.isloading = false;
          }
        });
    } else {
      console.log("Le formulaire est invalide !");
      for (const controlName in this.projectForm.controls) {
        const control = this.projectForm.get(controlName);
        if (control?.invalid && control?.touched) {
          console.log(`Le champ ${controlName} est invalide.`);
          console.log(control?.errors);
        }
      }
    }
  }

  addMember(memberData?: any): void {
    // S'assurer que le formulaire existe
    if (!this.form) {
      this.form = this.fb.group({
        members: this.fb.array([]),
      });
    }

    // Vérifier la validité du dernier membre
    if (this.members.length > 0) {
      const lastMember = this.members.at(this.members.length - 1);
      if (lastMember.invalid) {
        console.warn(
          "Le dernier membre est invalide. Impossible d'ajouter un nouveau membre."
        );
        return;
      }
    }

    const memberForm = this.fb.group({
      titre: [memberData?.titre || "", Validators.required],
      description: [memberData?.description || "", Validators.required],
    });

    this.members.push(memberForm);
  }
  lengthMo!: number;

  listMo: any[] = [];
  tacheToUpdate: any = null;
  usersToUpdate: any = [];
  fetchMo() {
    return this.projectService
      .all("users/by_role?roleName=Maitre d'ouvrage")
      .subscribe((response: ResponseData<any[]>) => {
        this.listMo = response.data.map((user) => {
          this._changeDetectorRef.detectChanges();
          const isAssigned =
            this.usersToUpdate?.some((u) => u.id === user.id) ||
            this.assignList.some((a) => a.id === user.id);
          return {
            ...user,
            checked: isAssigned ? "1" : "0",
          };
        });

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

  updateProject(projectRequest: any): void {
    this.isloading = true;
    const colors = {
      primary: this.projectForm.value.primaryColor,
      secondary: this.projectForm.value.secondaryColor,
      accent: this.projectForm.value.accentColor,
    };
    const normeProject: NormeProject[] = this.members.value;
    projectRequest.normes = normeProject;
    projectRequest.colors = JSON.stringify(colors);

    delete projectRequest.primaryColor;
    delete projectRequest.secondaryColor;
    delete projectRequest.accentColor;
    this.snackbar
      .showConfirmation("Voulez-vous vraiment modifier ce projet ?")
      .then((result) => {
        if (result["value"] == true) {
          this.projectService
            .update(`projects/updateProject`, projectRequest)
            .subscribe(
              (data: any) => {
                this.toastr.success("Modifier avec succés");
                this.matDialogRef.close(true);
                this.isloading = false;
              },
              (error) => {
                console.error("Error updating project:", error);
                this.toastr.error("Erreur lors de la mise à jour");
                this.isloading = false;
                this.matDialogRef.close(true);
              }
            );
        }
      });
  }

  // Conversion du Base64 en fichier

  deleteImage() {
    this.uploadedImage = null;
    this.toff = ""; // Reset to default image or empty string
    const fileInput = document.getElementById(
      "project-image-input"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  }

  selectOnFile(evt, type, name) {
    let accept = [];
    let extension = "";
    if (type === "photo_profile") {
      accept = [".png", ".PNG", ".jpg", ".JPG", ".jpeg", ".JPEG"];
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

  imageProjet: any;

  saveStoreFile(file) {
    let formData = new FormData();
    formData.append("file", file);
    this._changeDetectorRef.detectChanges();
    const dataFile = { file: file };
    this.isloading = true;
    this.clientServive.saveStoreFile(formData).subscribe(
      (resp) => {
        if (resp) {
          console.log(resp);
          this.imageProjet = `${this.urlImage + resp["fileName"]}`;
          this.projectForm.get("imageUrl").setValue(this.imageProjet);
          this.snackbar.openSnackBar("Image  joutée ", "OK", [
            "mycssSnackbarGreen",
          ]);
        }
        this.isloading = false;
      },
      (error) => {
        this.isloading = false;
        console.log(error);
        this.snackbar.showErrors(error);
      }
    );
  }

  presetColors: string[] = [
    "#3F51B5", // Bleu
    "#FF4081", // Rose
    "#4CAF50", // Vert
    "#FFC107", // Jaune
    "#9C27B0", // Violet
    "#E91E63", // Rose foncé
    "#00BCD4", // Cyan
    "#FF5722", // Orange
  ];

  openImageModal() {
    if (this.imageProjet) {
      this.dialog.open(ImageModalComponent, {
        data: { imageUrl: this.imageProjet }, // Passer l'URL de l'image à la modal
      });
    }
  }

  getInitials(name: string): string {
    if (!name) return "";
    const parts = name.split(" ");
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  // Dans votre classe component, assurez-vous d'avoir :
  // presetColors = ['#245363', '#93C5AF', '#FF9800', '#000000', '#FFFFFF', '#0C8439', '#D55E00'];

  async deleteMember(index: number): Promise<void> {
    // Demander confirmation
    const confirm = await this.snackbar.showConfirmation(
      "Voulez-vous vraiment supprimer cette norme ?"
    );
    if (!confirm.value) {
      return;
    }
    try {
      this.members.removeAt(index);
      this.snackbar.openSnackBar("Norme supprimée avec succès", "OK", [
        "mycssSnackbarGreen",
      ]);
    } catch (error) {
      console.error("Erreur lors de la suppression", error);
      this.snackbar.openSnackBar("Échec de la suppression", "OK", [
        "mycssSnackbarRed",
      ]);
    }
  }
}
