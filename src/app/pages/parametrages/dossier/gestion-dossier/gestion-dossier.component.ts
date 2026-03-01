import { DatePipe } from "@angular/common";
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { LocalService } from "src/app/core/services/local.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { PapAddComponent } from "src/app/pages/pap/pap-add/pap-add.component";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ButtonAction, TableauComponent } from "src/app/shared/tableau/tableau.component";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { UIModule } from "src/app/shared/ui/ui.module";
import { AddDossierComponent } from "./add-dossier/add-dossier.component";
import { ActionButton, PageActionsComponent } from "src/app/shared/refactore/page-actions/page-actions.component";

@Component({
  selector: "app-gestion-dossier",
  standalone: true,
  providers: [
    DatePipe,
    { provide: MatDialogRef, useValue: [] },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatPaginatorIntl },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: "outline" } },
  ],
  imports: [TableauComponent, UIModule, AngularMaterialModule, PageActionsComponent],
  templateUrl: "./gestion-dossier.component.html",
  styleUrl: "./gestion-dossier.component.css",
})
export class GestionDossierComponent implements OnInit {

  // ── Breadcrumb ────────────────────────────────────────────────────────────
  breadCrumbItems = [
    { label: "Dossier" },
    { label: "Liste des dossiers", active: true },
  ];

  // ── Page actions ──────────────────────────────────────────────────────────
  pageActions: ActionButton[] = [
    {
      label: "Ajouter un dossier",
      icon: "bx bx-plus",
      action: "add",
      type: "primary",
    },
  ];

  // ── Table ─────────────────────────────────────────────────────────────────
  headers: any[] = [];
  btnActions: ButtonAction[] = [];
  datas: any[] = [];
  dataSource: MatTableDataSource<any>;
  length = 0;
  loadData = false;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 100, 500, 1000];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  private readonly url = "documents";
  private currentProjectId: any;

  constructor(
    private snackbar: SnackBarService,
    private parentService: ServiceParent,
    public matDialogRef: MatDialogRef<PapAddComponent>,
    private cd: ChangeDetectorRef,
    private localService: LocalService,
    private coreService: CoreService,
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }

  ngOnInit(): void {
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.getDossiers();
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────
  getDossiers(): void {
    this.loadData = true;
    this.parentService.list(this.url, this.pageSize, this.pageIndex, this.currentProjectId).subscribe({
      next: (data: any) => {
        this.loadData = false;
        if (data?.responseCode === 200) {
          this.datas = data.data;
          this.length = data.length;
          this.dataSource = new MatTableDataSource(data.data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.cd.markForCheck();
        } else {
          this.dataSource = new MatTableDataSource();
        }
      },
      error: () => { this.loadData = false; },
    });
  }

  // ── Search ────────────────────────────────────────────────────────────────
  filterTable(searchValue: string): void {
    if (!this.dataSource) return;
    this.dataSource.filterPredicate = (data: any, filter: string) =>
      [data.libelle, data.urlDocument, data.categorie?.libelle]
        .some(v => v?.toLowerCase().includes(filter));
    this.dataSource.filter = searchValue.toLowerCase();
  }

  // ── Page action handler ───────────────────────────────────────────────────
  handlePageAction(action: string): void {
    if (action === 'add') this.addItems();
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  pageChanged(event: any): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.getDossiers();
  }

  // ── CRUD modals ───────────────────────────────────────────────────────────
  addItems(): void {
    this.snackbar.openModal(AddDossierComponent, "45rem", "new", "30rem", this.datas, "", () => this.getDossiers());
  }

  updateItems(information: any): void {
    this.snackbar.openModal(AddDossierComponent, "50rem", "edit", "", information, "", () => this.getDossiers());
  }

  detailItems(element: any): void {
    // TODO: implémenter la page détail dossier
  }

  supprimerItems(id: any): void {
    this.snackbar.showConfirmation("Voulez-vous vraiment supprimer ce dossier?").then((result) => {
      if (result?.value === true) {
        this.coreService.deleteItem(id, this.url).subscribe({
          next: (resp: any) => { if (resp?.responseCode === 200) this.getDossiers(); },
          error: (err) => this.snackbar.showErrors(err),
        });
      }
    });
  }

  // ── Table config ──────────────────────────────────────────────────────────
  createHeader() {
    return [
      { th: "Libellé",               td: "libelle"      },
      { th: "URL du Document",       td: "urlDocument"  },
      { th: "Catégorie de Document", td: "categorie", el: "libelle" },
    ];
  }

  createActions(): ButtonAction[] {
    return [
      { icon: "bxs-edit",        couleur: "green",   size: "icon-size-4", title: "Modifier",  isDisabled: false, action: (el) => this.updateItems(el)      },
      { icon: "bxs-trash-alt",   couleur: "#D45C00", size: "icon-size-4", title: "Supprimer", isDisabled: false, action: (el) => this.supprimerItems(el.id) },
      { icon: "bxs-info-circle", couleur: "black",   size: "icon-size-4", title: "Détail",    isDisabled: false, action: (el) => this.detailItems(el)       },
    ];
  }
}