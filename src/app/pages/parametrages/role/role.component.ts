import { DatePipe } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  OnInit,
  ViewChild,
} from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { AddRoleComponent } from "./add-role/add-role.component";
import { CoreService } from "src/app/shared/core/core.service";
import {
  ButtonAction,
  TableauComponent,
} from "src/app/shared/tableau/tableau.component";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { ExportService } from "src/app/shared/core/export.service";
import { UIModule } from "src/app/shared/ui/ui.module";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";

@Component({
  selector: "app-role",
  standalone: true,
  imports: [TableauComponent, UIModule, AngularMaterialModule],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./role.component.html",
  styleUrl: "./role.component.css",
})
export class RoleComponent implements OnInit {
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

  offset: number = 0;
  title: string = "Gestion des produits";
  url: string = "roles/all";

  headers: any = [];
  btnActions: any = [];

  roles: any[] = [];
  ngOnInit(): void {
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.getRole();
  }

  createHeader() {
    return [
      {
        th: "Id",
        td: "id",
      },
      {
        th: "Libelle",
        td: "name",
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
    ];
  }

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private parentService: ServiceParent,
    private _router: Router,
    private datePipe: DatePipe,
    private snackbar: SnackBarService,
    private _matDialog: MatDialog,
    private coreService: CoreService,
    //  public matDialogRef: MatDialogRef<>,
    private _changeDetectorRef: ChangeDetectorRef,
    public toastr: ToastrService
  ) {}

  getRole() {
    this.loadData = true;
    return this.parentService
      .list(this.url, this.pageSize, this.offset)
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
            console.log(data);
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

  updateItems(information): void {
    console.log(information);
    this.snackbar.openModal(
      AddRoleComponent,
      "35rem",
      "edit",
      "20rem",
      information,
      "",
      () => {
        this.getRole();
      }
    );
  }

  //cette fonction permet de supprimer
  supprimerItems(id, information) {
    this.snackbar
      .showConfirmation("Voulez-vous vraiment supprimer ce role?")
      .then((result) => {
        if (result["value"] == true) {
          this.deleteUser = true;
          this.currentIndex = information;
          this.showLoader = "isShow";
          const message = "role  supprimé";
          this.coreService.deleteItem(id, "roles/deleteRole").subscribe(
            (resp) => {
              this.showLoader = "isNotShow";
              if (resp["responseCode"] == 200) {
                this.getRole();
              }

              this.snackbar.openSnackBar("role  supprimé avec succés", "OK", [
                "mycssSnackbarGreen",
              ]);
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
  addItems(): void {
    this.snackbar.openModal(
      AddRoleComponent,
      "35rem",
      "new",
      "20rem",
      this.datas,
      "",
      () => {
        this.getRole();
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
    this.getRole();
  }
}
