import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Observable } from "rxjs";
import { BsModalService, ModalDirective } from "ngx-bootstrap/modal";
import {
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Store } from "@ngrx/store";
import { deleteuserlist } from "src/app/store/UserList/userlist.action";
import { selectData } from "src/app/store/UserList/userlist-selector";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { validatePhoneNumberSn } from "src/app/shared/pipes/numberSn";
import { MoService } from "src/app/core/services/mo.service";
import { Image } from "src/app/shared/models/image.model";
import { Mo, ResponseData } from "src/app/shared/models/Projet.model";
import { ToastrService } from "ngx-toastr";
import { el } from "@fullcalendar/core/internal-common";
import { Project } from "../../projects/project.model";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { UtilsService } from "src/app/shared/utils/utils.service";
import { User } from "src/app/store/Authentication/auth.models";
import { LocalService } from "src/app/core/services/local.service";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ButtonAction } from "src/app/shared/tableau/tableau.component";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { AddUserComponent } from "../../parametrages/utilisateur/add-user/add-user.component";
import { CoreService } from "src/app/shared/core/core.service";

@Component({
  selector: "app-molist",
  templateUrl: "./molist.component.html",
  styleUrl: "./molist.component.css",
})
export class MolistComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  term: any;
  contactsList: any;
  total: Observable<number>;
  createMoForm!: UntypedFormGroup;
  submitted = false;
  contacts: any;
  files: File[] = [];
  endItem: any;
  listMo: Mo[] = [];
  @ViewChild("newContactModal", { static: false })
  newContactModal?: ModalDirective;
  @ViewChild("removeItemModal", { static: false })
  removeItemModal?: ModalDirective;
  deleteId: any;
  returnedArray: any;

  @Input() fromDate: Date;
  @Input() toDate: Date;
  @Output() dateRangeSelected: EventEmitter<{}> = new EventEmitter();

  @ViewChild("dp", { static: true }) datePicker: any;

  dropdownData: any[] = [];
  settings: IDropdownSettings = {};
  form!: FormGroup;
  selectedItems: any[] = [];
  user: User;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  informations: any;
  displayedColumns: any;
  searchList: any;
  codeEnvoye: number; //code envoye par notre menu
  hasList: boolean;
  hasAdd: boolean;
  hasUpdate: boolean;
  hasDelete: boolean;
  hasDetail: boolean;
  length = 100;
  searchForm: UntypedFormGroup;
  dialogRef: any;
  dataSource: MatTableDataSource<any>;
  datas = [];
  currentIndex;
  loadData: boolean = false;
  exporter: boolean = false;
  isCollapsed: boolean = false;
  isSearch2: boolean = false;
  isSearch: boolean = false;
  deleteUser: boolean = false;
  rechercher = "";
  showLoader = "isNotShow";
  message = "";
  config: any;
  isLoading: boolean = false;
  pageSizeOptions = [5, 10, 25, 100, 500, 1000];
  pageSize: number = 10;
  pageIndex: number = 0;
  //constantes = CONSTANTES;
  userConnecter;
  offset: number = 0;
  title: string = "Gestion des produits";
  url: string = "users/by_role?roleName=utilisateur";
  panelOpenState = false;
  img;
  image;
  privilegeByRole: any;
  privilegeForPage: number = 2520;
  headers: any = [];
  btnActions: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private moservice: MoService,
    public store: Store,
    private coreService: CoreService,
    public toastr: ToastrService,
    //  private utilsService: UtilsService,
    private localService: LocalService,
    private snackbar: SnackBarService
  ) {}

  myImage: string;
  getImageFromBase64(imageType: string, imageName: number[]): string {
    const base64Representation = "data:" + imageType + ";base64," + imageName;
    return base64Representation;
  }

  ngOnInit() {
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.user = this.localService.getDataJson("user");
    console.log("user local data: ", this.user);
    this.breadCrumbItems = [
      { label: "Maitres d'ouvrages" },
      { label: "Listes", active: true },
    ];
    setTimeout(() => {
      this.fetchMo();
      document.getElementById("elmLoader")?.classList.add("d-none");
    }, 1200);



    this.createMoForm = this.formBuilder.group({
      id: [""],
      lastname: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(70),
        ],
      ],
      firstname: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(70),
        ],
      ],
      email: ["", [Validators.required, Validators.email]],
      contact: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(70),
          validatePhoneNumberSn(),
        ],
      ],
      locality: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(70),
        ],
      ],
      date_of_birth: ["", [Validators.required]],
      place_of_birth: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(70),
        ],
      ],
      // image: ["", []],
      project_ids: [[], this.formBuilder.array([])],
    });
    this.loadProject();
    this.settings = {
      idField: "id",
      textField: "libelle",
      selectAllText: "Select All Data",
      unSelectAllText: "UnSelect All Data",
      allowSearchFilter: true,
      noDataAvailablePlaceholderText: "Nothing to show data",
    };
  }

  onDataSelect(item: any) {
    console.log("onData Select", this.createMoForm.get("project_ids").value);
  }

  onUnSelectAll() {
    console.log("onData Select", this.createMoForm.get("project_ids").value);
  }

  onDataDeSelect(item: any) {
    console.log("onData Select", this.createMoForm.get("project_ids").value);
  }

  onSelectAll(items: any) {
    console.log("onData Select", this.createMoForm.get("project_ids").value);
  }

  onDeSelectAll(items: any) {
    console.log("onData Select", this.createMoForm.get("project_ids").value);
  }

  deleteImage() {
    // Logique pour supprimer l'image sélectionnée
    // Par exemple, réinitialisation de l'image à une image par défaut
    document
      .getElementById("member-img")
      .setAttribute("src", "assets/images/users/user-dummy-img.jpg");
    // Réinitialisation de l'input de type fichier pour effacer la sélection
    const inputElement = document.getElementById(
      "member-image-input"
    ) as HTMLInputElement;
    inputElement.value = "";
    this.uploadedImage = null;
  }

  selectedProjects: any[] = [];

  private updateSelectedProjects() {
    const selectedProjectsDetails = this.selectedProjects.map((project) => ({
      id: +project.id, // Convertit l'ID en nombre si nécessaire
      libelle: project.libelle, // Assure que le libellé est inclus
    }));
    this.createMoForm.patchValue({ project_ids: selectedProjectsDetails });
  }

  get f() {
    return this.createMoForm.controls;
  }
  // File Upload
  uploadedImage!: File;
  imageURL: string | undefined;
  saveUser() {
    var updateBtn = document.getElementById(
      "addContact-btn"
    ) as HTMLAreaElement;

    if (updateBtn.innerHTML == "Créer") {
      if (this.uploadedImage) {
        return this.moservice
          .uploadImage(this.uploadedImage, this.uploadedImage.name)
          .subscribe((ima: Image) => {
            this.handleCreateMoForm(ima);
          });
      } else {
        return this.handleCreateMoForm();
      }
    } else {
      return this.updateUser();
    }
  }

  handleCreateMoForm(image?: Image) {
    const projectRequest = this.createMoForm.value;
    if (image) {
      projectRequest.image = image;
    }
    if (this.createMoForm.get("project_ids").value) {
      projectRequest.project_ids = this.createMoForm
        .get("project_ids")
        .value.map((project: any) => +project.id);
    }
    this.moservice
      .add<ResponseData<Mo>>("users/createMo", projectRequest)
      .subscribe(
        (data: ResponseData<Mo>) => {
          console.log(data.data);
          this.toastr.success(data.message);
          this.listMo.unshift(data.data);
          this.createMoForm.reset();
          this.newContactModal.hide();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  // fiter job
  searchJob() {
    if (this.term) {
      this.contactsList = this.returnedArray.filter((data: any) => {
        return data.name.toLowerCase().includes(this.term.toLowerCase());
      });
    } else {
      this.contactsList = this.returnedArray;
    }
  }

  filteredMo: Mo[] = [];
  filterTable(event: any) {
    const searchValue = event.target.value.toLowerCase();
    if (searchValue) {
      this.filteredMo = this.listMo.filter(
        (project) =>
          project.email.toLowerCase().includes(searchValue) ||
          project.contact.toLowerCase().includes(searchValue) ||
          project.locality.toLowerCase().includes(searchValue) ||
          project.lastname.toLowerCase().includes(searchValue)
      );
    } else {
      this.filteredMo = this.listMo;
    }
  }

  // Edit User
  editUser(id: any) {
    this.submitted = false;
    this.newContactModal?.show();
    var modelTitle = document.querySelector(".modal-title") as HTMLAreaElement;
    modelTitle.innerHTML = "Edit Profile";
    var updateBtn = document.getElementById(
      "addContact-btn"
    ) as HTMLAreaElement;
    updateBtn.innerHTML = "Update";
    this.createMoForm.patchValue(this.listMo[id]);
    if (this.listMo[id].image) {
      document.querySelectorAll("#member-img").forEach((element: any) => {
        element.src = this.getImageFromBase64(
          this.listMo[id].image.type,
          this.listMo[id].image.image
        );
      });
      const image: any = this.getImageFromBase64(
        this.listMo[id].image.type,
        this.listMo[id].image.image
      );
      const file = this.base64ToFile(image, this.listMo[id].image.name);
      this.uploadedImage = file;
    }

    this.selectedProjects = this.listMo[id].projects;

    console.log(this.selectedProjects);
    this.updateSelectedProjects();
  }

  base64ToFile(base64String: string, fileName: string): File {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  }

  // pagechanged
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.endItem = event.page * event.itemsPerPage;
    this.contactsList = this.returnedArray.slice(startItem, this.endItem);
  }

  // Delete User
  removeUser(id: any) {
    this.deleteId = id;
    this.removeItemModal?.show();
  }

  confirmDelete(id: any) {
    this.store.dispatch(deleteuserlist({ id: this.deleteId }));
    this.removeItemModal?.hide();
  }

  fetchMo() {
    return this.moservice
      .all<ResponseData<Mo[]>>("users/by_role?roleName=Maitre d'ouvrage")
      .subscribe((users: ResponseData<Mo[]>) => {
        this.listMo = users.data;
        this.filteredMo = this.listMo;
      });
  }

  fileChange(event: any) {
    let fileList: any = event.target as HTMLInputElement;
    let file: File = fileList.files[0];
    this.uploadedImage = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      document.querySelectorAll("#member-img").forEach((element: any) => {
        element.src = this.imageURL;
      });
    };
    reader.readAsDataURL(file);
  }

  updateUser() {
    const projectRequest = this.createMoForm.value;

    // Récupérer et transformer project_ids en un tableau d'ID
    const projectIdsControl = this.createMoForm.get("project_ids");
    if (projectIdsControl && Array.isArray(projectIdsControl.value)) {
      const projectIdsArray = projectIdsControl.value.map(
        (project: { id: any }) => project.id
      );
      projectRequest.project_ids = projectIdsArray; // Mettez à jour projectRequest avec le tableau d'ID
    }

    if (this.uploadedImage) {
      return this.moservice
        .updateImage(
          this.uploadedImage,
          this.uploadedImage.name,
          this.createMoForm.get("id").value
        )
        .subscribe(
          (ima: Image) => {
            projectRequest.image = ima;
            this.updateUserDetails(projectRequest);
          },
          (err) => {
            console.log(err);
          }
        );
    } else {
      this.updateUserDetails(projectRequest);
    }
  }

  updateUserDetails(projectRequest) {
    this.moservice
      .update<ResponseData<Mo>, Mo>("users/updateMo", projectRequest)
      .subscribe(
        (data: ResponseData<Mo>) => {
          console.log(data.data);
          this.toastr.success(data.message);
          const index = this.listMo.findIndex((mo) => mo.id === data.data.id);
          if (index !== -1) {
            this.listMo[index] = data.data;
          }
          this.createMoForm.reset();
          this.newContactModal.hide();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  deleteUsers(userId: number) {
    this.moservice.delete<ResponseData<Mo>>(userId, "users/deleteMo").subscribe(
      (data: ResponseData<any>) => {
        console.log(data.message);
        this.toastr.success(data.message);
        this.filteredMo = this.filteredMo.filter((mo) => mo.id !== userId);
        this.removeItemModal?.hide();
      },
      (err) => {
        console.log(err);
        this.toastr.error("Error deleting user");
      }
    );
  }
  projectlist: any;
  loadProject() {
    return this.moservice
      .all<ResponseData<Project[]>>("projects/all")
      .subscribe((data: ResponseData<Project[]>) => {
        this.projectlist = data.data;
      });
  }

  createHeader() {
    return [
      {
        th: "Nom",
        td: "lastname",
      },
      {
        th: "PRENOM",
        td: "firstname",
      },
      {
        th: "Email",
        td: "email",
      },
      {
        th: "Role",
        td: "sous_role",
      },

      {
        th: "Numéro téléphone ",
        td: "contact",
      },
    ];
  }

  createActions(): ButtonAction[] {
    return [
      {
        icon: "bxs-edit",
        couleur: "green",
        size: "icon-size-4",
        title: "Modifier",
        isDisabled: this.hasUpdate,
        action: (element?) => this.updateItems(element),
      },
      {
        icon: "bxs-trash-alt",
        couleur: "red",
        size: "icon-size-4",
        title: "Supprimer",
        isDisabled: this.hasDelete,
        action: (element?) => this.supprimerItems(element.id, element),
      },
      {
        icon: "bxs-info-circle",
        couleur: "#00bfff	",
        size: "icon-size-4",
        title: "détail",
        isDisabled: this.hasDelete,
        action: (element?) => this.detailItems(element.id, element),
      },
    ];
  }
  detailItems(id: any, element: any) {
    throw new Error("Method not implemented.");
  }
  updateItems(information): void {
    console.log(information);
    this.snackbar.openModal(
      AddUserComponent,
      "50rem",
      "edit",
      "",
      information,
      "",
      () => {
        // this.getList();
      }
    );
  }

  //cette fonction permet de supprimer
  supprimerItems(id, information) {
    console.log("====================================");
    console.log(id);
    console.log("====================================");
    this.snackbar
      .showConfirmation("Voulez-vous vraiment supprimer ce utilisateur?")
      .then((result) => {
        if (result["value"] == true) {
          this.deleteUser = true;
          this.currentIndex = information;
          this.showLoader = "isShow";
          const message = "utilisateur  supprimé";
          this.coreService.deleteItem(id, "users/deleteMo").subscribe(
            (resp) => {
              this.showLoader = "isNotShow";
              if (resp["responseCode"] == 200) {
                // this.getUsers();
              }
            },
            (error) => {
              this.showLoader = "isNotShow";
              this.deleteUser = false;
              this.snackbar.showErrors(error);
            }
          );
        }
      });
  }
}
