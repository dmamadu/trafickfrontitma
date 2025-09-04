import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { FormBuilder, Validators, FormArray, FormGroup } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { Router } from "@angular/router";
import { DropzoneConfigInterface } from "ngx-dropzone-wrapper";
import { ToastrService } from "ngx-toastr";
import { Observable, debounceTime, switchMap, of } from "rxjs";
import { ProjectService } from "src/app/core/services/project.service";
import { dateValidator } from "src/app/shared/validator/datevalidator";
import { Project, ResponseData, NormeProject, Mo } from "../project.model";
import { SharedService } from "../shared.service";
import { Image } from "src/app/shared/models/image.model";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ClientVueService } from "../../admin/client-vue/client-vue.service";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "src/environments/environment";
@Component({
  selector: "app-update",
  templateUrl: "./update.component.html",
  styleUrl: "./update.component.css",
})
export class UpdateComponent {
  suggestions$!: Observable<string[]>;
  listProject: Project[];

  imageToff: any;

  urlImage = environment.apiUrl + "fileMinios/upload/";
  isloading: boolean = false;
  buttonText: string = "Créer le projet";
  lengthMo: any;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    public toastr: ToastrService,
    private snackbar: SnackBarService,
    private router: Router,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private clientServive: ClientVueService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.projectForm = this.fb.group(
      {
        id: [],
        imageUrl: ["", [Validators.required, Validators.maxLength(500)]],
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
        datedebut: ["", Validators.required],
        datefin: ["", Validators.required],
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
    this.assignMember = this.listMo;
    this.loadProject();

    this.form = this.fb.group({
      members: this.fb.array([]),
    });

    this.sharedService.selectedItem$.subscribe((item) => {
      console.log("====================================");
      console.log(item);
      console.log("====================================");
      if (item) {
        this.projectForm.patchValue({
          id: item.id,
          libelle: item.libelle,
          status: item.status,
          categorie: item.categorie,
          description: item.description,
          datedebut: item.datedebut,
          datefin: item.datefin,
        });
        //this.members.patchValue(item.)
        //this.listMo = item.users;

        this.membersData = item.normeProjets;
        item.normeProjets.forEach((member) => {
          this.addMember(member);
        });

        this.listMo = item.users.map((user) => {
          return {
            ...user,
            checked: "1",
          };
        });
        for (let index = 0; index < this.listMo.length; index++) {
          this.assignList.push(this.listMo[index]);
          this.assignListFormArray.push(this.fb.control(this.listMo[index]));
        }
        console.log("assis", this.assignList);
      }
    });
  }

  // File Upload
  imageURL: any;

  assignList: any = [];
  slectMember(id: number) {
    if (this.listMo[id].checked == "0") {
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

  uploadedImage!: File;
  toff: any;

  //uploadedFiles!: File[];

  imagePath: any;
  newProject: Project;
  newIdCat!: number;

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

  updateForm(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.projectForm.patchValue({
      categorie: inputValue,
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
  myImage: string;

  update(): void {
    const projectRequest = this.projectForm.value;
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
          const attachedFiles: File[] =
            this.projectForm.get("attachedFiles").value;
          if (data) {
            const normeProjects: NormeProject[] = this.members.value;
            normeProjects.forEach((normeProject: any) => {
              normeProject.project = data.data;
            });
            this.projectService
              .saveNormeProjet1(normeProjects, data.data.id)
              .subscribe(
                (response: NormeProject[]) => {
                  console.log(response);
                  this.router.navigate(["/projects/list"]);
                  this.projectForm.reset();
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
      normeProject.project = { id: projectId };
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
}
