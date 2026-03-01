import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ButtonAction } from "src/app/shared/tableau/tableau.component";
import { UIModule } from "../../../shared/ui/ui.module";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { DatePipe } from "@angular/common";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import * as XLSX from "xlsx";
import { Pap } from "../pap.model";
import { PapService } from "../pap.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { DatatableComponent } from "src/app/shared/datatable/datatable.component";
import { ToastrService } from "ngx-toastr";
import { SharedService } from "../../projects/shared.service";
import { LocalService } from "src/app/core/services/local.service";
import { CoreService } from "src/app/shared/core/core.service";
import { AddPapHabitatComponent } from "./add-pap-habitat/add-pap-habitat.component";
import { LoaderComponent } from "../../../shared/loader/loader.component";
import { Subject, takeUntil } from "rxjs";
import {
  ActionButton,
  PageActionsComponent,
} from "src/app/shared/refactore/page-actions/page-actions.component";
import { TableauComponent } from "src/app/shared/tableau/tableau.component";

// Messages constants
const MESSAGES = {
  DELETE_CONFIRM: "Voulez-vous vraiment supprimer ce parti affecté ?",
  DELETE_CONFIRM_BULK: "Voulez-vous vraiment supprimer ces partis affectés ?",
  DELETE_SUCCESS: "Parti affecté supprimé",
  DELETE_SUCCESS_BULK: "Partis affectés supprimés",
  IMPORT_CONFIRM: "Voulez-vous vraiment importer ces données ?",
  PROJECT_ERROR: "Vous devez vous connecter en tant que maître d'ouvrage responsable d'un projet.",
  PROJECT_ERROR_TITLE: "Action non autorisée",
  SUCCESS_SUFFIX: " avec succès",
} as const;

@Component({
  selector: "app-pap-habitat",
  standalone: true,
  templateUrl: "./pap-habitat.component.html",
  styleUrl: "./pap-habitat.component.css",
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
    AngularMaterialModule,
    DatatableComponent,
    FormsModule,
    LoaderComponent,
    PageActionsComponent,
  ],
})
export class PapHabitatComponent implements OnInit, OnDestroy {
  // Properties
  listPap: Pap[];
  breadCrumbItems: Array<{}>;
  
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  // Table configuration
  headers: any[] = [];
  btnActions: ButtonAction[] = [];
  dataSource: MatTableDataSource<any>;
  datas: any[] = [];
  length = 0;

  // Pagination
  pageSizeOptions = [5, 10, 25, 100, 500, 1000];
  pageSize: number = 10;
  pageIndex: number = 0;
  offset: number = 0;

  // Loading states
  loadData: boolean = false;
  deleteUser: boolean = false;

  // Project & URL
  currentProjectId: any;
  readonly url: string = "databasePapHabitat";

  // Excel import
  headings: any[] = [];
  dataExcel: any[] = [];

  // Actions configuration
  actions: ActionButton[] = [
    {
      label: "Ajouter un PAP habitat",
      icon: "plus",
      action: "add",
      type: "primary",
    },
    {
      label: "Importer Excel",
      icon: "file-excel",
      action: "import",
      type: "primary",
    },
    {
      label: "Exporter PDF",
      icon: "file-pdf",
      action: "export-pdf",
      type: "secondary",
      visible: false,
    },
    {
      label: "Exporter Excel",
      icon: "table-chart",
      action: "export-excel",
      type: "secondary",
      visible: false,
    },
  ];

  // Destroy subject for unsubscribe
  private destroy$ = new Subject<void>();

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private _router: Router,
    private snackbar: SnackBarService,
    private papService: PapService,
    private parentService: ServiceParent,
    public matDialogRef: MatDialogRef<any>,
    private _changeDetectorRef: ChangeDetectorRef,
    public toastr: ToastrService,
    private sharedService: SharedService,
    private localService: LocalService,
    private coreService: CoreService
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "PAP Habitat" },
      { label: "Liste", active: true },
    ];
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.getPapHabitat();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Header configuration
  createHeader() {
    return [
      { th: "CODE PAP", td: "codePap" },
      { th: "CODE HABITAT", td: "codeHabitat" },
      { th: "PRENOM", td: "prenom" },
      { th: "NOM", td: "nom" },
      { th: "NUMERO TELEPHONE", td: "numeroTelephone" },
    ];
  }

  // Actions configuration
  createActions(): ButtonAction[] {
    return [
      {
        icon: "bxs-edit",
        couleur: "green",
        size: "icon-size-4",
        title: "Modifier",
        isDisabled: false,
        action: (element?) => this.updateItems(element),
      },
      {
        icon: "bxs-info-circle",
        couleur: "black",
        size: "icon-size-4",
        title: "Détail",
        isDisabled: false,
        action: (element?) => this.detailItems(element.id, element),
      },
    ];
  }

  // Data fetching
  getPapHabitat() {
    this.loadData = true;
    return this.parentService
      .list(this.url, this.pageSize, this.offset, this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] == 200) {
            this.dataSource = new MatTableDataSource(data["data"]);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.datas = data["data"];
            this.length = data["length"];
            this._changeDetectorRef.markForCheck();
          } else {
            this.dataSource = new MatTableDataSource();
          }
        },
        (err) => {
          this.loadData = false;
          console.error("Error fetching PAP Habitat data:", err);
        }
      );
  }

  // Pagination
  pageChanged(event: any): void {
    this.datas = [];
    this._changeDetectorRef.markForCheck();
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.offset = this.pageIndex;
    this.getPapHabitat();
  }

  // Search handler
  handleSearch(searchValue: string): void {
    if (!searchValue.trim()) {
      this.getPapHabitat();
      return;
    }

    this.loadData = true;
    this.parentService
      .searchGlobal(
        this.url,
        searchValue,
        this.currentProjectId,
        this.pageSize,
        this.offset
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] == 200) {
            this.dataSource = new MatTableDataSource(data["data"]);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.datas = data["data"];
            this.length = data["length"];
            this._changeDetectorRef.markForCheck();
          } else {
            this.dataSource = new MatTableDataSource();
          }
        },
        (err) => {
          this.loadData = false;
          console.error("Error searching:", err);
        }
      );
  }

  // Action handler
  handleAction(action: string): void {
    switch (action) {
      case "add":
        this.addItems();
        break;
      case "import":
        this.triggerFileUpload();
        break;
      case "export-pdf":
        this.exportAs("pdf");
        break;
      case "export-excel":
        this.exportAs("excel");
        break;
    }
  }

  // CRUD Operations
  addItems(): void {
    if (!this.currentProjectId) {
      this.showProjectSelectionError();
      return;
    }

    this.snackbar.openModal(
      AddPapHabitatComponent,
      "50rem",
      "new",
      "auto",
      this.datas,
      "",
      () => this.getPapHabitat()
    );
  }

  updateItems(information: any): void {
    this.snackbar.openModal(
      AddPapHabitatComponent,
      "50rem",
      "edit",
      "auto",
      information,
      "",
      () => this.getPapHabitat()
    );
  }

  supprimerItems(id: number, information: any): void {
    this.snackbar
      .showConfirmation(MESSAGES.DELETE_CONFIRM)
      .then((result) => {
        if (result["value"] !== true) return;

        this.deleteUser = true;
        
        this.coreService
          .deleteItem(id, this.url)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            () => {
              this.getPapHabitat();
              this.deleteUser = false;
              this.snackbar.openSnackBar(
                MESSAGES.DELETE_SUCCESS + MESSAGES.SUCCESS_SUFFIX,
                "OK",
                ["mycssSnackbarGreen"]
              );
            },
            (error) => {
              this.deleteUser = false;
              this.snackbar.showErrors(error);
            }
          );
      });
  }

  handleBulkDelete(selectedIds: number[]): void {
    this.snackbar
      .showConfirmation(MESSAGES.DELETE_CONFIRM_BULK)
      .then((result) => {
        if (result["value"] !== true) return;

        this.deleteUser = true;
        
        this.papService
          .deleteMultipleByIds(this.url, selectedIds)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            () => {
              this.getPapHabitat();
              this.deleteUser = false;
              this.snackbar.openSnackBar(
                MESSAGES.DELETE_SUCCESS_BULK + MESSAGES.SUCCESS_SUFFIX,
                "OK",
                ["mycssSnackbarGreen"]
              );
            },
            (error) => {
              this.deleteUser = false;
              this.snackbar.showErrors(error);
            }
          );
      });
  }

  detailItems(id: number, information: any): void {
    this.localService.saveDataJson("pap", information);
    this.sharedService.setSelectedItem(information);
    this._router.navigate(["pap/detail"]);
  }

  // Excel Import
  fileUpload(event: any): void {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFile);
    
    fileReader.onload = (event: any) => {
      const binaryData = event.target.result;
      const workbook = XLSX.read(binaryData, { type: "binary" });
      
      workbook.SheetNames.forEach((sheet) => {
        const worksheet = workbook.Sheets[sheet];
        const data: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];
        
        const headers = data[0];
        this.headings = headers;
        
        const jsonData = data.slice(1).map((row: any[]) => {
          let obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index];
          });
          return obj;
        });
        
        this.dataExcel = jsonData;
      });
    };
  }

  triggerFileUpload(): void {
    if (!this.currentProjectId) {
      this.showProjectSelectionError();
      return;
    }
    
    const fileUploadElement = document.getElementById("file-upload") as HTMLInputElement;
    fileUploadElement?.click();
  }

  resetDataFromExcel(): void {
    this.headings = [];
    this.dataExcel = [];
  }

  importData(): void {
    this.snackbar
      .showConfirmation(MESSAGES.IMPORT_CONFIRM)
      .then((result) => {
        if (result["value"] !== true) return;

        this.loadData = true;
        const dataToSend = this.dataExcel.map((item) => ({
          ...item,
          projectId: +this.currentProjectId,
        }));

        this.papService
          .add(this.url, dataToSend)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data: any) => {
              this.toastr.success(data.message);
              this.dataExcel = [];
              this.getPapHabitat();
              this.loadData = false;
            },
            (err) => {
              this.loadData = false;
              console.error("Error importing data:", err);
              this.toastr.error(err);
            }
          );
      });
  }

  // Utility methods
  private showProjectSelectionError(): void {
    this.toastr.error(
      MESSAGES.PROJECT_ERROR,
      MESSAGES.PROJECT_ERROR_TITLE,
      {
        timeOut: 15000,
        progressBar: true,
        closeButton: true,
        enableHtml: true,
      }
    );
  }

  private exportAs(format: string): void {
    console.log(`Exporting as ${format}`);
    // TODO: Implement export logic
  }
}