import { CommonModule, DatePipe } from "@angular/common";
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from "@angular/material/form-field";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import {
  ButtonAction,
  TableauComponent,
} from "src/app/shared/tableau/tableau.component";
import { UIModule } from "src/app/shared/ui/ui.module";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { PapAddComponent } from "../../pap/pap-add/pap-add.component";
import { ToastrService } from "ngx-toastr";
import { CoreService } from "src/app/shared/core/core.service";
import { CreatetaskComponent } from "../createtask/createtask.component";
import { MatNativeDateModule, MatOptionModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { NgApexchartsModule } from "ng-apexcharts";
import { DndModule } from "ngx-drag-drop";
import { DetailComponent } from "../detail/detail.component";
import { LocalService } from "src/app/core/services/local.service";
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from "rxjs";
import { STATUT_OPTIONS } from "../tasks.constants";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.css",
  standalone: true,
  providers: [
    DatePipe,
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
  imports: [
    TableauComponent,
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
})
export class ListTacheComponent implements OnInit ,OnDestroy{
  readonly statutOptions = STATUT_OPTIONS;
  searchTerm = "";
  selectedStatut = "";
  private search$ = new Subject<string>();

  filterTable($event: Event): void {
    const value = ($event.target as HTMLInputElement).value;
    this.search$.next(value);
  }

  filterByStatut(statut: string): void {
    this.selectedStatut = statut;
    this.offset = 0;
    this.pageIndex = 0;
    this.getTaches();
  }

  breadCrumbItems: (
    | { label: string; active?: undefined }
    | { label: string; active: boolean }
  )[];
  DetailProject: any;
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
  url: string = "taches";
  panelOpenState = false;
  img;
  image;
  privilegeByRole: any; //liste des codes recu de l'api lors de la connexion
  privilegeForPage: number = 2520; //code privilege envoye pour afficher la page
  privilegePage;
  headers: any = [];
  btnActions: any = [];
  currentProjectId: any;
  constructor(
    private snackbar: SnackBarService,
    private parentService: ServiceParent,
    public matDialogRef: MatDialogRef<PapAddComponent>,
    private _changeDetectorRef: ChangeDetectorRef,
    public toastr: ToastrService,
    private localService: LocalService,
    private coreService: CoreService
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }

  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((term) => {
        this.searchTerm = term;
        this.offset = 0;
        this.pageIndex = 0;
        this.getTaches();
      });
    this.getTaches();
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.breadCrumbItems = [
      { label: "Taches" },
      { label: "Liste des taches", active: true },
    ];
  }

private destroy$ = new Subject<void>();

  ngOnDestroy() {
   this.destroy$.next();
   this.destroy$.complete();
}


  createHeader() {
    return [
      {
        th: "Libelle",
        td: "libelle",
      },
      {
        th: "Description",
        td: "description",
      },
      {
        th: "Etat",
        td: "statut",
      },
      {
        th: "Progression (%)",
        td: "progression",
        type: "n",
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
        permission: "TACHES_MODIFIER",
      },
      {
        icon: "bxs-trash-alt",
        couleur: "red",
        size: "icon-size-4",
        title: "Supprimer",
        isDisabled: this.hasDelete,
        action: (element?) => this.supprimerItems(element.id, element),
        permission: "TACHES_SUPPRIMER",
      },
      {
        icon: "bxs-info-circle",
        couleur: "text-red-400",
        size: "icon-size-4",
        title: "détail",
        isDisabled: this.hasDelete,
        action: (element?) => this.detailItems(element),
        permission: "TACHES_VOIR",
      },
    ];
  }

  getTaches() {
    this.loadData = true;
    return this.parentService
      .list(this.url, this.pageSize, this.offset, this.currentProjectId, {
        search: this.searchTerm,
        statut: this.selectedStatut,
      })
        .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] == 200) {
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
          this.loadData = false;
          console.log(err);
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
    this.getTaches();
  }

  //cette fonction permet de supprimer
  supprimerItems(id, information) {
    this.snackbar
      .showConfirmation("Voulez-vous vraiment supprimer cette tache?")
      .then((result) => {
        if (result["value"] == true) {
          const message = "tache  supprimé";
          this.coreService.deleteItemWithProject(id, this.url, this.currentProjectId).subscribe(
            (resp) => {
              this.snackbar.openSnackBar(message + " avec succès", "OK", [
                "mycssSnackbarGreen",
              ]);
              this.getTaches();
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

  filterList() {
    this.isCollapsed = !this.isCollapsed;
  }

  record(item) {}

  addItems(): void {
    if (!this.currentProjectId) {
      this.showProjectSelectionError();
      return;
    }

    this.snackbar.openModal(
      CreatetaskComponent,
      "45rem",
      "new",
      "auto",
      this.datas,
      "",
      () => {
        this.getTaches();
      }
    );
  }

  updateItems(information): void {
    if (!this.currentProjectId) {
      this.showProjectSelectionError();
      return;
    }
    console.log(information);
    this.snackbar.openModal(
      CreatetaskComponent,
      "40rem",
      "edit",
      "",
      information,
      "",
      () => {
        this.getTaches();
      }
    );
  }

  detailItems(information): void {
    console.log(information);
    this.snackbar.openModal(
      DetailComponent,
      "45rem",
      "",
      "35rem",
      information,
      "",
      () => {
        this.getTaches();
      }
    );
  }

  private showProjectSelectionError(): void {
    this.toastr.error(
      "Vous devez vous connecter en tant que maître d'ouvrage responsable d'un projet.",
      "Action non autorisée",
      {
        timeOut: 15000,
        progressBar: true,
        closeButton: true,
        enableHtml: true,
      }
    );
  }
}
