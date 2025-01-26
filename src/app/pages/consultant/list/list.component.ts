import { DatePipe } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import {  Router } from "@angular/router";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import {
  ButtonAction,
  TableauComponent,
} from "src/app/shared/tableau/tableau.component";
import { UIModule } from "src/app/shared/ui/ui.module";
import { PapService } from "../../pap/pap.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { PapAddComponent } from "../../pap/pap-add/pap-add.component";
import { ToastrService } from "ngx-toastr";
import { SharedService } from "../../projects/shared.service";
import { LocalService } from "src/app/core/services/local.service";
import { AddComponent } from "../add/add.component";
import { CoreService } from "src/app/shared/core/core.service";
import { LoaderComponent } from "../../../shared/loader/loader.component";

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
  imports: [TableauComponent, UIModule, AngularMaterialModule, LoaderComponent],
})
export class ListComponent implements OnInit {
  role: string;

  breadCrumbItems: (
    | { label: string; active?: undefined }
    | { label: string; active: boolean }
  )[];
  filterTable($event: any) {
    throw new Error("Method not implemented.");
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  informations: any;
  codeEnvoye: number; //code envoye par notre menu
  hasAdd: boolean;
  hasUpdate: boolean;
  hasDelete: boolean;
  hasDetail: boolean;
  length = 100;
  dialogRef: any;
  dataSource: MatTableDataSource<any>;
  datas = [];
  deleteUser: boolean = false;
  loadData: boolean = false;
  isLoading: boolean = false;
  pageSizeOptions = [5, 10, 25, 100, 500, 1000];
  pageSize: number = 10;
  pageIndex: number = 0;
  //constantes = CONSTANTES;
  userConnecter;
  offset: number = 0;
  title: string = "Gestion des produits";
  url: string = "users/by_role?roleName=Consultant";
  image;
  headers: any = [];
  btnActions: any = [];

  constructor(
    private _router: Router,
    private snackbar: SnackBarService,
    private papService: PapService,
    public matDialogRef: MatDialogRef<PapAddComponent>,
    private _changeDetectorRef: ChangeDetectorRef,
    public toastr: ToastrService,
    private sharedService: SharedService,
    private localService: LocalService,
    private coreService: CoreService,
  ) {}
  lienBrute: string;
  lien: string;
  pathUrl: string="consultant";

  ngOnInit(): void {

    this.getConsultants();
    this.headers = this.createHeader();
    this.btnActions = this.createActions();

    this.breadCrumbItems = [
      { label: "Consultant" },
      { label: "List des consulants", active: true },
    ];
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



  pageChanged(event) {
    console.log(event);
    this.datas = [];
    this._changeDetectorRef.markForCheck();
    console.log(event.pageIndex);
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.offset = this.pageIndex;
    this.getConsultants();
  }

  updateItems(information): void {
    console.log(information);
    this.snackbar.openModal(
      AddComponent,
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
      .showConfirmation("Voulez-vous vraiment supprimer ce consultant?")
      .then((result) => {
        if (result["value"] == true) {
          this.deleteUser = true;
          const message = "Consultant  supprimé";
          this.coreService.deleteItem(id, "users/deleteMo").subscribe(
            (resp) => {
              if (resp["200"]) {
                this.getConsultants();
              }
            },
            (error) => {
              this.deleteUser = false;
              this.snackbar.showErrors(error);
            }
          );
        }
      });
  }

  filterList() {
  }

  //cette fonction permet d'exporter la liste sous format excel ou pdf
  exportAs(format) {
    const nom = "Liste des produits";
    let value = [];
  }

  exempleGenPdfHeaderFooter(userName, fileName) {}

  record(item) {}

  addItems(): void {
    this.snackbar.openModal(
      AddComponent,
      "55rem",
      "new",
      "",
      this.datas,
      "",
      () => {
        this.getConsultants();
      }
    );
  }

  convertedJson: string;

  headings = [];
  dataExcel = [];

  resetDataFromExcel() {
    this.headings = [];
    this.dataExcel = [];
    this.convertedJson = "";
  }

  triggerFileUpload() {
    const fileUploadElement = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileUploadElement) {
      fileUploadElement.click();
    }
  }

  importData() {
    return this.papService
      .add("personneAffectes/importer", this.dataExcel)
      .subscribe(
        (data: any) => {
          console.log(data);
          this.toastr.success(data.message);
          this.dataExcel = [];
          this.getConsultants();
        },
        (err) => {
          this.toastr.error(err);
        }
      );
  }

  detailItems(id, information) {
    console.log(information);
    this.localService.saveDataJson("consultant", information);
    this.sharedService.setSelectedItem(information);
    this._router.navigate(["consultant/detail"]);
  }



  getConsultants() {
    this.loadData = true;
    return this.papService
      .all(`users/by_role?roleName=${this.pathUrl}`)
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
}
