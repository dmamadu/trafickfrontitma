import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  ViewChild,
  Output,
  ChangeDetectorRef,
} from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { Observable, debounceTime, of, switchMap } from "rxjs";
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
import { MatDialog } from "@angular/material/dialog";
import { ImageModalComponent } from "src/app/shared/image-modal.component";

@Component({
  selector: "app-create",
  templateUrl: "./create.component.html",
  styleUrls: ["./create.component.scss"],
})

/**
 * Projects-create component
 */
export class CreateComponent implements OnInit {
  [x: string]: any;
  imageToff: any;

  suggestions$!: Observable<string[]>;
  listProject: Project[];
  urlImage = environment.apiUrl + "fileAws/download/";
  isloading: boolean = false;
  buttonText: string = "Créer le projet";
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private projectService: ProjectService,
    public toastr: ToastrService,
    private router: Router,
    private snackbar: SnackBarService,
    private clientServive: ClientVueService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.projectForm = this.fb.group(
      {
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
        // image: ["", Validators.required],
        // attachedFiles: [],
        users: this.fb.array([]),
        primaryColor: ["#3F51B5", [Validators.required]],
        secondaryColor: ["#FF4081", [Validators.required]],
        accentColor: ["#4CAF50", [Validators.required]],
      }
      // { validators: dateValidator() }
    );
  }
  get assignListFormArray(): FormArray {
    return this.projectForm.get("users") as FormArray;
  }

  get f() {
    return this.projectForm.controls;
  }
  // bread crumb items
  breadCrumbItems: Array<{}>;
  hidden: boolean;
  assignMember: any;
  projectForm: FormGroup;

  @Input() fromDate: Date;
  @Input() toDate: Date;
  @Output() dateRangeSelected: EventEmitter<{}> = new EventEmitter();

  @ViewChild("dp", { static: true }) datePicker: any;
  dropdownList = [];
  selectedItems = [];

  membersData: any[] = [];

  form: FormGroup;
  dropdownSettings = {};
  ngOnInit() {
    this.breadCrumbItems = [
      { label: "Projects" },
      { label: "Create New", active: true },
    ];
    this.fetchMo();
    this.hidden = true;
    this.assignMember = this.listMo;
    this.loadProject();

    this.form = this.fb.group({
      members: this.fb.array([]),
    });
  }

  // File Upload
  imageURL: any;

  assignList: any = [];
  slectMember(id: number) {
    if (this.listMo[id].checked == "0") {
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

  create() {
    return this.projectService
      .add<ResponseData<Project>>(
        "projects/createProject",
        this.projectForm.value
      )
      .subscribe((data: ResponseData<Project>) => {
        this.toastr.success(`${data.message}`);
        this.projectForm.reset();
      });
  }

  uploadedImage!: File;
  toff: any;

  //uploadedFiles!: File[];

  imagePath: any;
  newProject: Project;
  newIdCat!: number;

  save() {
    // Cast vers HTMLButtonElement si c'est un bouton, sinon vers HTMLElement
    const updateBtn = document.getElementById(
      "addContact-btn"
    ) as HTMLButtonElement | null;

    // Vérifiez que l'élément existe
    if (!updateBtn) {
      console.error("L'élément avec l'ID 'addContact-btn' n'a pas été trouvé.");
      return;
    }

    // Vérifiez le texte du bouton
    const buttonText = updateBtn.innerText || updateBtn.textContent;

    if (buttonText === "Modifier le projet") {
      return this.update();
    } else if (buttonText === "Créer le projet") {
      return this.addProject();
    } else {
      console.error(
        "Le texte du bouton ne correspond pas aux valeurs attendues."
      );
    }
  }

  addProject() {
    this.createProject(this.projectForm.value);
  }

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
      console.log("data send", projectRequest);

      this.snackbar
        .showConfirmation("Voulez-vous vraiment créer le projet ?")
        .then((result) => {
          if (result["value"] == true) {
            this.projectService
              .add<ResponseData<Project>>(
                "projects/createProject",
                projectRequest
              )
              .subscribe(
                (data: ResponseData<Project>) => {
                  console.log("Project created successfully:", data);
                  this.toastr.success(`${data.message}`);
                  this.router.navigate(["/projects/list"]);
                  this.toastr.success(`Projet créé avec succès`);
                  this.isloading = false;
                },
                (error) => {
                  console.error("Error creating project:", error);
                  this.toastr.error(`Une erreur s'est produite`);
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

  loadProject() {
    return this.projectService
      .all<ResponseData<Project[]>>("projects/all")
      .subscribe((data: ResponseData<Project[]>) => {
        this.listProject = data.data;
        console.log(this.listProject);
      });
  }
  // filechange
  imageURLs: any;

  updateForm(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.projectForm.patchValue({
      categorie: inputValue,
    });
  }
  updateFormWithSelectedOption(event: MatAutocompleteSelectedEvent) {
    this.projectForm.patchValue({
      categorie: event.option.value,
    });
  }

  get members(): FormArray {
    return this.form.get("members") as FormArray;
  }

  addMember(memberData?: any) {
    if (this.members.length > 0) {
      const lastMember = this.members.at(this.members.length - 1);
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

    this.members.push(memberForm);
  }

  lengthMo!: number;

  listMo: Mo[] = [];
  fetchMo() {
    return this.projectService
      .all("users/by_role?roleName=Maitre d'ouvrage")
      .subscribe((users: any) => {
        this.listMo = users.data.map((user) => {
          return {
            ...user,
            checked: "0",
          };
        });
        this.lengthMo = users.data.length;
        console.log(users.data);
        console.log("length: " + this.lengthMo);
      });
  }

  addItems(): void {
    this.snackbar.openModal(
      AddMaitreOuvrageComponent,
      "57rem",
      "new",
      "38rem",
      "",
      "",
      () => {
        this.fetchMo();
      }
    );
  }

  myImage: string;

  //update

  update(): void {
    this.updateProject(this.projectForm.value);
  }

  updateProject(projectRequest: any): void {
    const normeProjects: NormeProject[] = this.members.value;
    projectRequest.normes = normeProjects;
    this.projectService
      .update<ResponseData<Project>, Project>(
        `projects/updateProject`,
        projectRequest
      )
      .subscribe(
        (data: ResponseData<Project>) => {
          console.log("Project updated successfully:", data);
          this.toastr.success(`${data.message}`);
          this.router.navigate(["/projects/list"]);
        },
        (error) => {
          console.error("Error updating project:", error);
          this.toastr.error(
            "Une erreur s'est produite lors de la mise à jour du projet."
          );
        }
      );
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

  deleteMember(index: number): void {
    // Vérifier que le formulaire et le tableau des membres existent
    if (!this.form || !this.members) {
      console.error(
        "Le formulaire ou le tableau des membres n'est pas initialisé"
      );
      return;
    }

    // Vérifier que l'index est valide
    if (index < 0 || index >= this.members.length) {
      console.error("Index invalide pour la suppression");
      return;
    }

    // Supprimer le membre à l'index spécifié
    this.members.removeAt(index);

    // Optionnel : afficher un message de confirmation
    this.snackbar.openSnackBar("Norme supprimée avec succès", "OK", [
      "mycssSnackbarGreen",
    ]);
  }
}
