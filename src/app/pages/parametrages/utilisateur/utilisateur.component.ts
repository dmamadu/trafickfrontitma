import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatPaginatorIntl, MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LocalService } from 'src/app/core/services/local.service';
import { ServiceParent } from 'src/app/core/services/serviceParent';
import { AngularMaterialModule } from 'src/app/shared/angular-materiel-module/angular-materiel-module';
import { CoreService } from 'src/app/shared/core/core.service';
import { SnackBarService } from 'src/app/shared/core/snackBar.service';
import { ButtonAction, TableauComponent } from 'src/app/shared/tableau/tableau.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { PapAddComponent } from '../../pap/pap-add/pap-add.component';
import { PapService } from '../../pap/pap.service';
import { SharedService } from '../../projects/shared.service';
import { AddComponent } from '../../tasks/add/add.component';
import { AddUserComponent } from './add-user/add-user.component';

@Component({
  selector: 'app-utilisateur',
  standalone: true,
  providers: [
    {
      provide: MatDialogRef,
      useValue: [],
    },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatPaginatorIntl },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: "outline" },
    },
  ],
  imports: [TableauComponent, UIModule, AngularMaterialModule],
  templateUrl: './utilisateur.component.html',
  styleUrl: './utilisateur.component.css'
})
export class UtilisateurComponent  implements OnInit {
filterTable($event: any) {
throw new Error('Method not implemented.');
}

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
  deleteUser: boolean = false;
  currentIndex;
  loadData: boolean = false;
  exporter: boolean = false;
  isCollapsed: boolean = false;
  isSearch2: boolean = false;
  isSearch: boolean = false;
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
  privilegeByRole: any; //liste des codes recu de l'api lors de la connexion
  privilegeForPage: number = 2520; //code privilege envoye pour afficher la page
  privilegePage;
  headers: any = [];
  btnActions: any = [];

  breadCrumbItems: (
    | { label: string; active?: undefined }
    | { label: string; active: boolean }
  )[];

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private _router: Router,
    private datePipe: DatePipe,
    private snackbar: SnackBarService,
    private _matDialog: MatDialog,
    private papService: PapService,
    private parentService: ServiceParent,
    public matDialogRef: MatDialogRef<PapAddComponent>,
    private _changeDetectorRef: ChangeDetectorRef,
    public toastr: ToastrService,
    private sharedService: SharedService,
    private localService: LocalService,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.getUsers();

    this.breadCrumbItems = [
      { label: "Utilisateur" },
      { label: "Liste des utilisateurs", active: true },
    ];
  }


  getUsers() {
    return this.papService.all("users/all").subscribe(
      (data: any) => {
        this.loadData = false;
        console.log('====================================');
        console.log(data);
        console.log('====================================');
        if (data["status"] == 200) {
          this.loadData = false;
          console.log(data);
          this.dataSource = new MatTableDataSource(data["data"]);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.datas = data["data"];
          this.length = data["length"];
          console.log("length", this.length);
          this._changeDetectorRef.markForCheck();
        } else {
          this.loadData = false;
          this.dataSource = new MatTableDataSource();
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  addItems(): void {
    this.snackbar.openModal(
      AddUserComponent,
      "55rem",
      "new",
      "auto",
      this.datas,
      "",
      () => {
        this.getUsers();
      }
    );
  }

  pageChanged(event) {
    console.log(event);
    this.datas = [];
    this._changeDetectorRef.markForCheck();
    console.log(event.pageIndex);
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.offset = this.pageIndex;
    this.getUsers();
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
    throw new Error('Method not implemented.');
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
              if (resp["responseCode"] ==200) {
                this.getUsers();
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
