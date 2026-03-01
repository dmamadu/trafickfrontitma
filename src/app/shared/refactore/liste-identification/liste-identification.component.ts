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
import { DatePipe, CommonModule } from "@angular/common";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { PapService } from "../pap.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { ToastrService } from "ngx-toastr";
import { SharedService } from "../../projects/shared.service";
import { LocalService } from "src/app/core/services/local.service";
import { CoreService } from "src/app/shared/core/core.service";
import { LoaderComponent } from "../../../shared/loader/loader.component";
import { Subject, takeUntil } from "rxjs";
import {
  ActionButton,
  PageActionsComponent,
} from "src/app/shared/refactore/page-actions/page-actions.component";
import { TableauComponent } from "src/app/shared/tableau/tableau.component";
import { FormulaireIdentificationComponent } from "./formulaire-identification/formulaire-identification.component";

const MESSAGES = {
  NO_PROJECT: "Aucun projet sélectionné",
  LOAD_ERROR: "Erreur lors du chargement des données",
  IDENTIFICATION_SUCCESS: "PAP identifié avec succès",
} as const;

@Component({
  selector: "app-liste-identification",
  standalone: true,
  templateUrl: "./liste-identification.component.html",
  providers: [
    DatePipe,
    { provide: MatDialogRef, useValue: [] },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatPaginatorIntl },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: "outline" } },
  ],
  imports: [
    CommonModule,
    TableauComponent,
    UIModule,
    AngularMaterialModule,
    FormsModule,
    LoaderComponent,
    PageActionsComponent,
  ],
})
export class ListeIdentificationComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  headers: any[] = [];
  btnActions: ButtonAction[] = [];
  dataSource: MatTableDataSource<any>;
  datas: any[] = [];
  length = 0;
  breadCrumbItems: Array<{}>;

  pageSizeOptions = [5, 10, 25, 100, 500];
  pageSize: number = 10;
  pageIndex: number = 0;
  offset: number = 0;

  loadData: boolean = false;

  currentProjectId: any;
  readonly url: string = "databasePapPlaceAffaire";

  actions: ActionButton[] = [
    { 
      label: "Rafraîchir", 
      icon: "refresh", 
      action: "refresh", 
      type: "secondary" 
    },
    { 
      label: "Exporter liste", 
      icon: "download", 
      action: "export", 
      type: "secondary" 
    },
  ];

  private destroy$ = new Subject<void>();

  // Statistiques
  statsTotal: number = 0;
  statsToday: number = 0;
  statsWeek: number = 0;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private _router: Router,
    private snackbar: SnackBarService,
    private papService: PapService,
    private parentService: ServiceParent,
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
      { label: "PAP" },
      { label: "Identification terrain", active: true },
    ];
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.getPapACompleter();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createHeader() {
    return [
      { th: "CODE PAP", td: "codePap" },
      { th: "COMMUNE", td: "commune" },
      { th: "DÉPARTEMENT", td: "departement" },
      { th: "DATE CRÉATION", td: "createdAt" },
      { th: "REMARQUES", td: "informationsEtendues" },
    ];
  }

  createActions(): ButtonAction[] {
    return [
      {
        icon: "bxs-user-check",
        couleur: "green",
        size: "icon-size-4",
        title: "Identifier ce PAP",
        isDisabled: false,
        action: (element?) => this.identifierPap(element),
      },
      {
        icon: "bxs-info-circle",
        couleur: "blue",
        size: "icon-size-4",
        title: "Voir informations",
        isDisabled: false,
        action: (element?) => this.voirDetail(element),
      },
      {
        icon: "bxs-map",
        couleur: "orange",
        size: "icon-size-4",
        title: "Localiser",
        isDisabled: (element?) => !element?.commune && !element?.departement,
        action: (element?) => this.localiserPap(element),
      },
    ];
  }

  getPapACompleter() {
    if (!this.currentProjectId) {
      this.toastr.error(MESSAGES.NO_PROJECT);
      return;
    }

    this.loadData = true;
    
    // Appel API avec filtre statutCompletion = "a_completer"
    this.parentService
      .list(this.url, this.pageSize, this.offset, this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] == 200) {
            // Filtrer uniquement les PAP à compléter
            const papACompleter = data["data"].filter(
              (pap: any) => pap.statutCompletion === "a_completer"
            );
            
            this.dataSource = new MatTableDataSource(papACompleter);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.datas = papACompleter;
            this.length = papACompleter.length;
            this.calculateStats();
            this._changeDetectorRef.markForCheck();
          } else {
            this.dataSource = new MatTableDataSource();
            this.toastr.error(MESSAGES.LOAD_ERROR);
          }
        },
        (err) => {
          this.loadData = false;
          this.toastr.error(MESSAGES.LOAD_ERROR);
        }
      );
  }

  calculateStats(): void {
    this.statsTotal = this.datas.length;
    
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Compter les PAP complétés aujourd'hui (si vous avez un champ dateCompletion)
    // Pour l'instant on met 0
    this.statsToday = 0;
    this.statsWeek = 0;
  }

  pageChanged(event: any): void {
    this.datas = [];
    this._changeDetectorRef.markForCheck();
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.offset = this.pageIndex;
    this.getPapACompleter();
  }

  filterTable(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.trim();
    if (!searchTerm) {
      this.getPapACompleter();
      return;
    }

    this.loadData = true;
    this.parentService
      .searchGlobal(this.url, searchTerm, this.currentProjectId, this.pageSize, this.offset)
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] == 200) {
            // Filtrer uniquement les PAP à compléter
            const papACompleter = data["data"].filter(
              (pap: any) => pap.statutCompletion === "a_completer"
            );
            
            this.dataSource = new MatTableDataSource(papACompleter);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.datas = papACompleter;
            this.length = papACompleter.length;
            this._changeDetectorRef.markForCheck();
          } else {
            this.dataSource = new MatTableDataSource();
          }
        },
        (err) => {
          this.loadData = false;
        }
      );
  }

  identifierPap(pap: any): void {
    this.snackbar.openModal(
      FormulaireIdentificationComponent,
      "60rem",
      "identify",
      "auto",
      pap,
      "",
      () => {
        this.getPapACompleter();
        this.toastr.success(MESSAGES.IDENTIFICATION_SUCCESS);
      }
    );
  }

  voirDetail(pap: any): void {
    this.localService.saveDataJson("pap", pap);
    this.sharedService.setSelectedItem(pap);
    this._router.navigate(["pap/detail"]);
  }

  localiserPap(pap: any): void {
    // Ouvrir une carte ou naviguer vers une page de localisation
    this.toastr.info(`Localisation: ${pap.commune || ''} ${pap.departement || ''}`);
    // TODO: Implémenter la carte si nécessaire
  }

  handleSearch(searchValue: string): void {
    // Déjà géré par filterTable
  }

  handleAction(action: string): void {
    switch (action) {
      case "refresh":
        this.getPapACompleter();
        this.toastr.success("Liste actualisée");
        break;
      case "export":
        this.exportList();
        break;
    }
  }

  exportList(): void {
    // TODO: Implémenter l'export Excel/PDF de la liste
    this.toastr.info("Export en cours de développement");
  }
}