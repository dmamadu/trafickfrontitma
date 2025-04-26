import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Observable } from "rxjs";
import {ModalDirective } from "ngx-bootstrap/modal";
import {
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Store } from "@ngrx/store";
import { deleteuserlist } from "src/app/store/UserList/userlist.action";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { validatePhoneNumberSn } from "src/app/shared/pipes/numberSn";
import { MoService } from "src/app/core/services/mo.service";
import { Image } from "src/app/shared/models/image.model";
import { Mo, ResponseData } from "src/app/shared/models/Projet.model";
import { ToastrService } from "ngx-toastr";
import { Project } from "../../projects/project.model";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { User } from "src/app/store/Authentication/auth.models";
import { LocalService } from "src/app/core/services/local.service";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ButtonAction } from "src/app/shared/tableau/tableau.component";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { AddUserComponent } from "../../parametrages/utilisateur/add-user/add-user.component";
import { CoreService } from "src/app/shared/core/core.service";
import { AddMaitreOuvrageComponent } from "../add-maitre-ouvrage/add-maitre-ouvrage.component";
import { DetailUserComponent } from "../detail-user/detail-user.component";

@Component({
  selector: "app-molist",
  templateUrl: "./molist.component.html",
  styleUrl: "./molist.component.css",
})
export class MolistComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  total: Observable<number>;
  createMoForm!: UntypedFormGroup;
  submitted = false;
  endItem: any;
  listMo: Mo[] = [];
  @ViewChild("newContactModal", { static: false })
  newContactModal?: ModalDirective;
  @ViewChild("removeItemModal", { static: false })
  removeItemModal?: ModalDirective;
  deleteId: any;
  returnedArray: any;

  @Input() fromDate: Date;
  @Output() dateRangeSelected: EventEmitter<{}> = new EventEmitter();

  dropdownData: any[] = [];
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
  dialogRef: any;
  dataSource: MatTableDataSource<any>;
  datas = [];
  loadData: boolean = false;
  isLoading: boolean = false;
  pageSizeOptions = [5, 10, 25, 100, 500, 1000];
  pageSize: number = 10;
  pageIndex: number = 0;
  //constantes = CONSTANTES;
  userConnecter;
  offset: number = 0;
  title: string = "Gestion des maitres d'ouvrages";
  url: string = "users/by_role?roleName=Maitre d'ouvrage";
  panelOpenState = false;
  image;
  headers: any = [];
  btnActions: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private moservice: MoService,
    public store: Store,
    private coreService: CoreService,
    public toastr: ToastrService,
    private localService: LocalService,
    private snackbar: SnackBarService
  ) {}

  myImage: string;

  ngOnInit() {
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.user = this.localService.getDataJson("user");
    this.fetchMo();
    console.log("user local data: ", this.user);
    this.breadCrumbItems = [
      { label: "Maitres d'ouvrages" },
      { label: "Listes", active: true },
    ];




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
      project_ids: [[], this.formBuilder.array([])],
    });

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

    this.selectedProjects = this.listMo[id].projects;

    console.log(this.selectedProjects);
    this.updateSelectedProjects();
  }



  // pagechanged
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.endItem = event.page * event.itemsPerPage;
   // this.contactsList = this.returnedArray.slice(startItem, this.endItem);
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
    this.loadData = true;
    return this.moservice
      .all(`users/by_role?roleName=Maitre d'ouvrage`)
      .subscribe(
        (data: any) => {
          if (data["status"] == 200) {
            this.loadData = false;
            console.log(data);
            this.dataSource = new MatTableDataSource(data["data"]);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.datas = data["data"];
            this.length = data["length"];
            console.log("length", this.length);
          } else {
            this.loadData = false;
            this.dataSource = new MatTableDataSource();
          }
        },
        (err) => {
          console.log(err);
          this.loadData = false;
        }
      );
  }



  projectlist: any;


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
        couleur: "#D45C00",
        size: "icon-size-4",
        title: "Supprimer",
        isDisabled: this.hasDelete,
        action: (element?) => this.supprimerItems(element.id),
      },
      {
        icon: "bxs-info-circle",
        couleur: "black	",
        size: "icon-size-4",
        title: "détail",
        isDisabled: this.hasDelete,
        action: (element?) => this.detailItems(element),
      },
    ];
  }



  detailItems(information): void {
    console.log(information);
    this.snackbar.openModal(
      DetailUserComponent,
      "57rem",
      "edit",
      "38",
      information,
      "",
      () => {
         this.fetchMo();
      }
    );
  }
  updateItems(information): void {
    console.log(information);
    this.snackbar.openModal(
      AddUserComponent,
      "57rem",
      "edit",
      "38",
      information,
      "",
      () => {
         this.fetchMo();
      }
    );
  }

  //cette fonction permet de supprimer
  supprimerItems(id) {
    this.snackbar
      .showConfirmation("Voulez-vous vraiment supprimer ce utilisateur?")
      .then((result) => {
        if (result["value"] == true) {
          const message = "utilisateur  supprimé";
          this.coreService.deleteItem(id, "users/deleteMo").subscribe(
            (resp) => {
              if (resp["responseCode"] == 200) {
                // this.getUsers();
              }
            },
            (error) => {
              this.snackbar.showErrors(error);
            }
          );
        }
      });
  }



  addItems(): void {
    this.snackbar.openModal(
      AddMaitreOuvrageComponent,
      "57rem",
      "new",
      "38rem",
      this.datas,
      "",
      () => {
        this.fetchMo();
      }
    );
  }


}
