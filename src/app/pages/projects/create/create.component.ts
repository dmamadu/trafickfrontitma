import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  ViewChild,
  Output,
  ChangeDetectorRef,
} from "@angular/core";
import { member } from "./data";
import { DropzoneConfigInterface } from "ngx-dropzone-wrapper";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { Observable, debounceTime, of, switchMap } from "rxjs";
import { ProjectService } from "src/app/core/services/project.service";
import { Mo, NormeProject, Project } from "src/app/shared/models/Projet.model";
import { ResponseData } from "src/app/shared/models/Projet.model";
import { ToastrService } from "ngx-toastr";
import { Image } from "src/app/shared/models/image.model";
import { Router } from "@angular/router";
import { SharedService } from "../shared.service";
import { dateValidator } from "src/app/shared/validator/datevalidator";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ClientVueService } from "../../admin/client-vue/client-vue.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-create",
  templateUrl: "./create.component.html",
  styleUrls: ["./create.component.scss"],
})

/**
 * Projects-create component
 */
export class CreateComponent implements OnInit {
  suggestions$!: Observable<string[]>;
  listProject: Project[];
  urlImage = environment.apiUrl + "image/getFile/";
  buttonText: string = "Créer le projet";
  constructor(
    private fb: FormBuilder,
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
        categorie: [
          "",
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ],
        ],
        description: [
          "",
          [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(500),
          ],
        ],
        //imageUrl: ["", [Validators.required, Validators.maxLength(500)]],
        datedebut: ["", Validators.required],
        datefin: ["", Validators.required],
        // image: ["", Validators.required],
        // attachedFiles: [],
        users: this.fb.array([]),
      },
      { validators: dateValidator() }
    );
    this.suggestions$ = this.projectForm.get("categorie").valueChanges.pipe(
      debounceTime(200),
      switchMap((query) => of(["agricole", "miniére", "traveaux publiques"]))
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
  selected: any;
  hidden: boolean;
  files: File[] = [];
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
    this.projectForm.reset();
    this.breadCrumbItems = [
      { label: "Projects" },
      { label: "Create New", active: true },
    ];
    this.fetchMo();
    this.selected = "";
    this.hidden = true;
    this.assignMember = this.listMo;
    this.loadProject();

    this.form = this.fb.group({
      members: this.fb.array([]),
    });
  }

  // File Upload
  imageURL: any;
  onSelect(event: any) {
    this.files.push(...event.addedFiles);
    let file: File = event.addedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      this.f.image.patchValue(this.imageURL);
      setTimeout(() => {
        // this.profile.push(this.imageURL)
      }, 100);
    };
    reader.readAsDataURL(file);
  }

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
    if (this.uploadedImage) {
      this.projectService
        .uploadImage(this.uploadedImage, this.uploadedImage.name)
        .subscribe(
          (img: Image) => {
            const projectRequest = this.projectForm.value;
            if (img) {
              projectRequest.image = img;
            }
            this.createProject(projectRequest);
          },
          (error) => {
            console.error("Error uploading image:", error);
            const projectRequest = this.projectForm.value;
            this.createProject(projectRequest);
          }
        );
    } else {
      console.warn(
        "this.projectService.uploadImage is not defined. Proceeding without uploading image."
      );
      // Continuer avec la création du projet sans télécharger d'image
      const projectRequest = this.projectForm.value;
      this.createProject(projectRequest);
    }
  }

  createProject(projectRequest: any): void {
    this.snackbar
      .showConfirmation("Voulez-vous vraiment créer le projet ?")
      .then((result) => {
        if (result["value"] == true) {
          // Call to add the project
          this.projectService
            .add<ResponseData<Project>>(
              "projects/createProject",
              projectRequest
            )
            .subscribe(
              (data: ResponseData<Project>) => {
                console.log("Project created successfully:", data);
                this.toastr.success(`${data.message}`);
                const normeProject: NormeProject[] = this.members.value;
                let saveNormeRequests = [];

                normeProject.forEach((normeProject: any) => {
                  normeProject.project = data.data;
                  const saveRequest = this.projectService
                    .saveNormeProjet(normeProject, data.data.id)
                    .toPromise();
                  saveNormeRequests.push(saveRequest);
                });

                Promise.all(saveNormeRequests)
                  .then(() => {
                    this.router.navigate(["/projects/list"]);
                  })
                  .catch((err) => {
                    console.error("Error saving norme project:", err);
                  });
              },
              (error) => {
                console.error("Error creating project:", error);
              }
            );
        }
      });
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
  fileChange(event: any) {
    let fileList: any = event.target as HTMLInputElement;
    let file: File = fileList.files[0];
    this.uploadedImage = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageURLs = reader.result as string;
      this.toff = this.imageURLs;
      //  reader.readAsDataURL(this.uploadedImage);
      document.querySelectorAll("#projectlogo-img").forEach((element: any) => {
        element.src = this.imageURLs;
      });
      console.log("====================================");
      console.log(this.imageURLs);
      console.log("====================================");
    };
  }
  // file upload
  public dropzoneConfig: DropzoneConfigInterface = {
    clickable: true,
    addRemoveLinks: true,
    previewsContainer: false,
    acceptedFiles: null,
  };

  uploadedFiles: any[] = [];
  uploadFiles1: File[] = [];

  // File Remove
  removeFile(event: any) {
    const index = this.uploadedFiles.indexOf(event);
    if (index > -1) {
      this.uploadedFiles.splice(index, 1);
      this.projectForm.patchValue({
        attachedFiles: this.uploadedFiles,
      });
    }
  }

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

  deleteMember(i: number) {
    this.members.removeAt(i);
  }

  listMo: Mo[] = [];
  fetchMo() {
    return this.projectService
      .all<ResponseData<any[]>>("users/all")
      .subscribe((users: ResponseData<Mo[]>) => {
        this.listMo = users.data.map((user) => {
          return {
            ...user,
            checked: "0",
          };
        });
      });
  }

  myImage: string;
  getImageFromBase64(imageType: string, imageName: number[]): string {
    const base64Representation = "data:" + imageType + ";base64," + imageName;
    return base64Representation;
  }

  //update

  update(): void {
    const projectRequest = this.projectForm.value;
    const attachedFiles: File[] = this.projectForm.get("attachedFiles").value;
    // Vérifier si uploadedImage est défini
    if (this.uploadedImage) {
      this.projectService
        .uploadImage(this.uploadedImage, this.uploadedImage.name)
        .subscribe(
          (img: Image) => {
            if (img) {
              projectRequest.image = img;
            }
            this.updateProject(projectRequest);
          },
          (error) => {
            console.error("Error uploading image:", error);
            // Continuer avec la mise à jour du projet même en cas d'erreur de téléchargement d'image
            this.updateProject(projectRequest);
          }
        );
    } else {
      console.warn("No image uploaded. Proceeding without uploading image.");
      this.updateProject(projectRequest);
    }
  }

  updateProject(projectRequest: any): void {
    this.projectService
      .update<ResponseData<Project>, Project>(
        `projects/updateProject`,
        projectRequest
      )
      .subscribe(
        (data: ResponseData<Project>) => {
          console.log("Project updated successfully:", data);
          this.toastr.success(`${data.message}`);
          if (data) {
            const normeProjects: NormeProject[] = this.members.value;
            normeProjects.forEach((normeProject: any) => {
              normeProject.project = data.data;
            });
            this.projectService
              .saveNormeProjet1(normeProjects, data.data.id)
              .subscribe(
                (response) => {
                  console.log(response);
                },
                (err) => {
                  console.log(err);
                }
              );
          }
        },
        (error) => {
          console.error("Error updating project:", error);
        }
      );
  }
  updateNormeProjects(projectId: number, normeProjects: NormeProject[]): void {
    normeProjects.forEach((normeProject: any) => {
      normeProject.project = { id: projectId }; // Assuming normeProject has a 'project' property that is an object
      this.projectService.saveNormeProjet(normeProject, projectId).subscribe(
        (data) => {
          console.log("Norme updated successfully:", data);
        },
        (err) => {
          console.error("Error updating norme:", err);
        }
      );
    });
  }

  // Conversion du Base64 en fichier
  base64ToFile(
    base64String: string,
    fileName: string,
    mimeType: string,
    dataURL: string
  ): File {
    // Décoder la chaîne Base64 en une chaîne binaire
    const byteString = atob(base64String);
    const byteNumbers = new Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteNumbers[i] = byteString.charCodeAt(i);
    }

    // Créer un tableau de type Uint8Array à partir des octets
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    // Créer un objet File à partir du Blob
    const file = new File([blob], fileName, { type: mimeType });

    // Ajouter la propriété dataURL
    Object.defineProperty(file, "dataURL", {
      value: dataURL,
      writable: false,
      enumerable: true,
    });

    return file;
  }

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
      accept = [".png", ".PNG", ".jpg", ".JPG"];
      extension = "une image";
    }
    for (const file of evt.target.files) {
      const index = file.name.lastIndexOf(".");
      const strsubstring = file.name.substring(index, file.name.length);
      const ext = strsubstring;
      // Verification de l'extension du ficihier est valide
      if (accept.indexOf(strsubstring) === -1) {
        this.snackbar.openSnackBar(
          "Ce fichier " + file.name + " n'est " + extension,
          "OK",
          ["mycssSnackbarRed"]
        );
        return;
      } else {
        // recuperation du fichier et conversion en base64
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
    this.clientServive
      .saveStoreFile("image/uploadFileDossier", formData)
      .subscribe(
        (resp) => {
          if (resp) {
            console.log(resp);
            this.imageProjet = `${this.urlImage + resp["data"]}`;
            this.projectForm.get("imageUrl").setValue(this.imageProjet);
            this.snackbar.openSnackBar("Image  joutée ", "OK", [
              "mycssSnackbarGreen",
            ]);
          }
        },
        (error) => {
          console.log(error);
          this.snackbar.showErrors(error);
        }
      );
  }

  onUploadSuccess(event: any) {
    let accept = [];
    let extension = "";

    accept = [
      ".png",
      ".PNG",
      ".jpg",
      ".JPG",
      ".jpeg",
      ".JPEG",
      ".pdf",
      ".PDF",
      ".doc",
      ".DOC",
      ".docx",
      ".DOCX",
      ".xls",
      ".XLS",
      ".xlsx",
      ".XLSX",
    ];

    for (const file of event) {
      const index = file.name.lastIndexOf(".");
      const fileExtension = file.name.substring(index).toLowerCase();

      // Vérifier si l'extension du fichier est valide
      if (accept.indexOf(fileExtension) === -1) {
        this.snackbar.openSnackBar(
          "Le fichier " + file.name + " n'est pas " + extension + " valide",
          "OK",
          ["mycssSnackbarRed"]
        );
        return;
      } else {
        // Appel de la fonction pour sauvegarder directement le fichier (sans conversion base64)
        this.saveStoreFile1(file);
      }
    }
  }

  saveStoreFile1(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    // Envoyer le fichier au serveur
    this.clientServive
      .saveStoreFile("image/uploadFileDossier", formData)
      .subscribe(
        (resp) => {
          if (resp) {
            console.log(resp);

            // Récupérer l'URL du fichier depuis la réponse
            const fileUrl = `${this.urlImage + resp["data"]}`;

            // Ajouter l'URL au tableau uploadedFiles
            this.uploadedFiles.push({
              name: file.name,
              size: file.size,
              type: file.type,
              url: fileUrl,
            });

            this.projectForm.patchValue({
              attachedFiles: fileUrl, // Mettez à jour avec l'ensemble des fichiers
            });

            // Optionnel : rafraîchir la vue si nécessaire
            this._changeDetectorRef.detectChanges();
          }
        },
        (error) => {
          console.log(error);
          this.snackbar.showErrors(error);
        }
      );
  }
}
