import { DatePipe } from "@angular/common";
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { Subject, takeUntil } from "rxjs";
import * as XLSX from "xlsx";
import { LocalService } from "src/app/core/services/local.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ButtonAction, TableauComponent } from "src/app/shared/tableau/tableau.component";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { UIModule } from "src/app/shared/ui/ui.module";
import { PlaintePreviewComponent } from "../plainte-preview/plainte-preview.component";
import { ExportService } from "src/app/shared/core/export.service";
import { AddPlainteComponent } from "../add-plainte/add-plainte.component";
import { PlainteDetailComponent } from "../palainte-detail/plainte-detail.component";
import { PlainteService } from "../plainte.service";
import { PlainteImportResult } from "../plainte.model";
import { FlatpickrModule } from "angularx-flatpickr";

const COLONNES_PLAINTE = [
  "statut",                   // 0
  "numeroReference",          // 1
  "dateEnregistrement",       // 2
  "moisReception",            // 3
  "codePap",                  // 4
  "nomPrenom",                // 5
  "mandataire",               // 6
  "sexe",                     // 7
  "telephone",                // 8
  "perimetreGmp",             // 9
  "numeroParcelle",           // 10
  "typeCarteIdentite",        // 11
  "cin",                      // 12
  "typePap",                  // 13
  "villageQuartier",          // 14
  "plainteParZone",           // 15
  "categorisation",           // 16
  "objetPlainte",             // 17
  "niveauGravite",            // 18
  "descriptionPlainte",       // 19
  "facilitateur",             // 20
  "descriptionReglement",     // 21
  "observations",             // 22
  "communicationResolution1", // 23
  "dateTraitementConsultant", // 24
  "dateVisite",               // 25
  "communicationResolution2", // 26
  "dateTraitementClm",        // 27
  "communicationResolution3", // 28
  "dateTraitementCcd",        // 29
  "resolutionPlainte",        // 30
  "siNonExpliquez",           // 31
  "prochaineEtape",           // 32
  "dateCloture",              // 33
  "delaiResolution",          // 34
];

@Component({
  selector: "app-list-plainte",
  templateUrl: "./list-plainte.component.html",
  standalone: true,
  providers: [
    DatePipe,
    { provide: MatDialogRef, useValue: [] },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatPaginatorIntl },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: "outline" } },
    ExportService,
  ],
  imports: [
    TableauComponent,
    UIModule,
    AngularMaterialModule,
    PlaintePreviewComponent,
    FlatpickrModule,
  ],
  styleUrl: "./list-plainte.component.css",
})
export class ListPlainteComponent implements OnInit, OnDestroy {
  breadCrumbItems!: ({ label: string; active?: undefined } | { label: string; active: boolean })[];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: any;
  datas: any[] = [];
  dataSource!: MatTableDataSource<any>;
  headers: any[] = [];
  btnActions: any[] = [];

  loadData = false;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  offset = 0;
  pageSizeOptions = [5, 10, 25, 100, 500, 1000];

  currentProjectId: any;
  canBulkDelete = false;

  headings: string[] = [];
  dataExcel: any[] = [];
  selectedFile: File | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private plainteService: PlainteService,
    private snackbar: SnackBarService,
    public toastr: ToastrService,
    private localService: LocalService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }

  ngOnInit(): void {
    this.headers = this.createHeaders();
    this.btnActions = this.createActions();
    this.loadPlaintes();
    this.breadCrumbItems = [
      { label: "Plainte" },
      { label: "Liste des plaintes", active: true },
    ];
    const user = this.localService.getDataJson("user");
    this.canBulkDelete = ["Super Admin", "Admin"].includes(user?.role?.[0]?.name);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createHeaders() {
    return [
      { th: "Référence",   td: "numeroReference",   sortable: true  },
      { th: "Plaignant",   td: "nomPrenom",          sortable: true  },
      { th: "Code PAP",    td: "codePap",            sortable: false },
      { th: "Date",        td: "dateEnregistrement", sortable: true  },
      { th: "Catégorie",   td: "categorisation",     sortable: true  },
      { th: "Gravité",     td: "niveauGravite",      sortable: true  },
      { th: "Statut",      td: "statut",             sortable: true  },
      { th: "Localité",    td: "villageQuartier",    sortable: false },
      { th: "Facilitateur",td: "facilitateur",       sortable: false },
    ];
  }

  createActions(): ButtonAction[] {
    return [
      {
        icon: "bxs-edit",
        couleur: "green",
        size: "icon-size-4",
        title: "Modifier",
        isDisabled: false,
        action: (element: any) => this.updateItems(element),
      },
      {
        icon: "bxs-trash-alt",
        couleur: "#D45C00",
        size: "icon-size-4",
        title: "Supprimer",
        isDisabled: false,
        action: (element: any) => this.supprimerItems(element.id),
      },
      {
        icon: "bxs-info-circle",
        couleur: "black",
        size: "icon-size-4",
        title: "Détail",
        isDisabled: false,
        action: (element: any) => this.detailItems(element),
      },
    ];
  }

  loadPlaintes(): void {
    if (!this.currentProjectId) return;
    this.loadData = true;
    this.plainteService
      .getByProject(+this.currentProjectId, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.loadData = false;
          if (data?.responseCode == 200) {
            this.datas = data.data;
            this.length = data.length ?? data.totalElements ?? 0;
            this.dataSource = new MatTableDataSource(this.datas);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          } else {
            this.datas = [];
            this.dataSource = new MatTableDataSource<any>([]);
          }
          this._changeDetectorRef.markForCheck();
        },
        error: () => {
          this.loadData = false;
          this.toastr.error("Erreur lors du chargement des plaintes");
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  pageChanged(event: any): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.offset = this.pageIndex;
    this.loadPlaintes();
  }

  filterTable(event: Event): void {
    const term = (event.target as HTMLInputElement).value.trim();
    if (this.dataSource) {
      this.dataSource.filter = term.toLowerCase();
    }
  }

  addItems(): void {
    if (!this.currentProjectId) {
      this.toastr.error(
        "Vous devez vous connecter en tant que maître d'ouvrage responsable d'un projet.",
        "Action non autorisée",
        { timeOut: 15000, progressBar: true, closeButton: true }
      );
      return;
    }
    this.snackbar.openModal(AddPlainteComponent, "55rem", "new", "", this.datas, "", () => {
      this.loadPlaintes();
    });
  }

  updateItems(element: any): void {
    this.snackbar.openModal(AddPlainteComponent, "50rem", "edit", "", element, "", () => {
      this.loadPlaintes();
    });
  }

  supprimerItems(id: number): void {
    this.snackbar.showConfirmation("Voulez-vous vraiment supprimer cette plainte ?").then((result) => {
      if (result?.value !== true) return;
      this.plainteService.deletePlainte(id).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
          if (resp?.responseCode == "200" || resp?.responseCode == 200) {
            this.loadPlaintes();
            this.snackbar.openSnackBar("Plainte supprimée avec succès", "OK", ["mycssSnackbarGreen"]);
          } else {
            this.snackbar.openSnackBar("Erreur lors de la suppression", "OK", ["mycssSnackbarRed"]);
          }
        },
        error: (err) => this.snackbar.showErrors(err),
      });
    });
  }

  handleBulkDelete(selectedIds: number[]): void {
    this.snackbar
      .showConfirmation(
        `Voulez-vous vraiment supprimer ces ${selectedIds.length} plainte(s) ? Cette action est définitive.`
      )
      .then((result) => {
        if (result?.value !== true) return;
        this.plainteService
          .deleteMultipleByIds(selectedIds)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadPlaintes();
              this.snackbar.openSnackBar("Plaintes supprimées avec succès", "OK", ["mycssSnackbarGreen"]);
            },
            error: (err) => this.snackbar.showErrors(err),
          });
      });
  }

  detailItems(element: any): void {
    this.snackbar.openModal(PlainteDetailComponent, "auto", "edit", "", element, "", () => {
      this.loadPlaintes();
    });
  }

  // ── Import Excel ──────────────────────────────────────────────

  triggerFileUpload(): void {
    (document.getElementById("file-upload") as HTMLInputElement)?.click();
  }

  fileUpload(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (e: any) => {
      this.processExcelFile(e.target.result);
    };
  }

  private processExcelFile(buffer: ArrayBuffer): void {
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

    this.headings = COLONNES_PLAINTE;
    this.dataExcel = rows
      .slice(1)
      .filter((row) => row[1])
      .map((row) => {
        const obj: any = {};
        COLONNES_PLAINTE.forEach((col, i) => {
          obj[col] = row[i] ?? null;
        });
        return obj;
      });
    this._changeDetectorRef.markForCheck();
  }

  importData(): void {
    if (!this.selectedFile) return;
    this.snackbar.showConfirmation("Confirmer l'import des plaintes ?").then((result) => {
      if (result?.value !== true) return;
      this.loadData = true;
      this.plainteService
        .importerExcel(this.selectedFile!, +this.currentProjectId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: PlainteImportResult) => {
            this.loadData = false;
            this.toastr.success(
              `${result.importees} plainte(s) importée(s), ${result.doublons} doublon(s) ignoré(s)`
            );
            this.resetDataFromExcel();
            this.loadPlaintes();
          },
          error: () => {
            this.loadData = false;
            this.toastr.error("Erreur lors de l'import");
          },
        });
    });
  }

  resetDataFromExcel(): void {
    this.headings = [];
    this.dataExcel = [];
    this.selectedFile = null;
    const input = document.getElementById("file-upload") as HTMLInputElement;
    if (input) input.value = "";
  }
}
