import { DatePipe } from "@angular/common";
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ButtonAction, TableauComponent } from "src/app/shared/tableau/tableau.component";
import { UIModule } from "src/app/shared/ui/ui.module";
import { AddCategorieDossierComponent } from "./add-categorie-dossier/add-categorie-dossier.component";
import { AddCategorieComponent } from "../../categorie-utilisateur/add-categorie/add-categorie.component";
import { ActionButton, PageActionsComponent } from "src/app/shared/refactore/page-actions/page-actions.component";

@Component({
  selector: "app-categorie-dossier",
  standalone: true,
  imports: [TableauComponent, UIModule, AngularMaterialModule, PageActionsComponent],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./categorie-dossier.component.html",
  styleUrl: "./categorie-dossier.component.css",
})
export class CategorieDossierComponent implements OnInit {

  // ── Breadcrumb ────────────────────────────────────────────────────────────
  breadCrumbItems = [
    { label: "Catégories" },
    { label: "Dossiers", active: true },
  ];

  // ── Page actions ──────────────────────────────────────────────────────────
  pageActions: ActionButton[] = [
    {
      label: "Créer une catégorie",
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

  private readonly url = "categorieDocuments";

  constructor(
    private parentService: ServiceParent,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.getCategories();
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────
  getCategories(): void {
    this.loadData = true;
    this.parentService.list(this.url, this.pageSize, this.pageIndex).subscribe({
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
      [data.id?.toString(), data.libelle]
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
    this.getCategories();
  }

  // ── CRUD modals ───────────────────────────────────────────────────────────
  addItems(): void {
    this.snackbar.openModal(AddCategorieDossierComponent, "35rem", "new", "20rem", this.datas, "", () => this.getCategories());
  }

  updateItems(information: any): void {
    this.snackbar.openModal(AddCategorieComponent, "50rem", "edit", "", information, "", () => this.getCategories());
  }

  supprimerItems(id: any): void {
    this.snackbar.showConfirmation("Voulez-vous vraiment supprimer cette catégorie?").then((result) => {
      if (result?.value === true) {
        this.coreService.deleteItem(id, this.url).subscribe({
          next: () => {
            this.getCategories();
            this.snackbar.openSnackBar("Catégorie supprimée avec succès", "OK", ["mycssSnackbarGreen"]);
          },
          error: (err) => this.snackbar.showErrors(err),
        });
      }
    });
  }

  // ── Table config ──────────────────────────────────────────────────────────
  createHeader() {
    return [
      { th: "Id",      td: "id"      },
      { th: "Libelle", td: "libelle" },
    ];
  }

  createActions(): ButtonAction[] {
    return [
      { icon: "bxs-edit",      couleur: "green",   size: "icon-size-4", title: "Modifier",  isDisabled: false, action: (el) => this.updateItems(el)      },
      { icon: "bxs-trash-alt", couleur: "#D45C00", size: "icon-size-4", title: "Supprimer", isDisabled: false, action: (el) => this.supprimerItems(el.id) },
    ];
  }
}