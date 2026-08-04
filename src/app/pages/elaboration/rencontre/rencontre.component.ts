import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { ToastrService } from "ngx-toastr";
import { LocalService } from "src/app/core/services/local.service";
import { ProjectService } from "src/app/core/services/project.service";
import { PapAddComponent } from "src/app/pages/pap/pap-add/pap-add.component";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ButtonAction, TableauComponent } from "src/app/shared/tableau/tableau.component";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { UIModule } from "src/app/shared/ui/ui.module";
import { AddRencontreComponent } from "../add-rencontre/add-rencontre.component";
import { ActionButton, PageActionsComponent } from "src/app/shared/refactore/page-actions/page-actions.component";

@Component({
  selector: "app-rencontre",
  standalone: true,
  providers: [
    { provide: MatDialogRef, useValue: [] },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatPaginatorIntl },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: "outline" } },
  ],
  imports: [TableauComponent, UIModule, AngularMaterialModule, PageActionsComponent],
  templateUrl: "./rencontre.component.html",
  styleUrl: "./rencontre.component.css",
})
export class RencontreComponent implements OnInit {

  // ── Breadcrumb ────────────────────────────────────────────────────────────
  breadCrumbItems = [
    { label: "Rencontre" },
    { label: "Liste des rencontres", active: true },
  ];

  // ── Page actions ──────────────────────────────────────────────────────────
  pageActions: ActionButton[] = [
    {
      label: "Ajouter une rencontre",
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

  private readonly url = "rencontres";
  private currentProjectId: any;

  constructor(
    private snackbar: SnackBarService,
    private projectService: ProjectService,
    public matDialogRef: MatDialogRef<PapAddComponent>,
    private cd: ChangeDetectorRef,
    private localService: LocalService,
    private coreService: CoreService,
    private toastr: ToastrService,
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }

  ngOnInit(): void {
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.getRencontres();
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────
  getRencontres(): void {
    this.loadData = true;
    this.projectService.getRencontreByProjectId(this.currentProjectId).subscribe({
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
      [data.libelle, data.date, data.urlPvRencontre]
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
    this.getRencontres();
  }

  // ── CRUD modals ───────────────────────────────────────────────────────────
  addItems(): void {
    if (!this.currentProjectId) {
      this.toastr.error(
        "Vous devez vous connecter en tant que maître d'ouvrage responsable d'un projet.",
        "Action non autorisée",
        { timeOut: 15000, progressBar: true, closeButton: true, enableHtml: true }
      );
      return;
    }
    this.snackbar.openModal(AddRencontreComponent, "45rem", "new", "30rem", this.datas, "", () => this.getRencontres());
  }

  updateItems(information: any): void {
    this.snackbar.openModal(AddRencontreComponent, "50rem", "edit", "30rem", information, "", () => this.getRencontres());
  }

  detailItems(element: any): void {
    // TODO: implémenter la page détail rencontre
  }

  supprimerItems(id: any): void {
    this.snackbar.showConfirmation("Voulez-vous vraiment supprimer cette rencontre?").then((result) => {
      if (result?.value === true) {
        this.coreService.deleteItemWithProject(id, this.url, this.currentProjectId).subscribe({
          next: (resp: any) => { if (resp?.responseCode === 200) this.getRencontres(); },
          error: (err) => this.snackbar.showErrors(err),
        });
      }
    });
  }

  // ── Table config ──────────────────────────────────────────────────────────
  createHeader() {
    return [
      { th: "Libellé",              td: "libelle"        },
      { th: "Date de la rencontre", td: "date"           },
      { th: "PV de la rencontre",   td: "urlPvRencontre" },
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