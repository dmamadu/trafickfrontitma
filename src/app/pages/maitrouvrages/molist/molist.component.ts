import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ButtonAction } from "src/app/shared/tableau/tableau.component";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { CoreService } from "src/app/shared/core/core.service";
import { LocalService } from "src/app/core/services/local.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { AddMaitreOuvrageComponent } from "../add-maitre-ouvrage/add-maitre-ouvrage.component";
import { AddUserComponent } from "../../parametrages/utilisateur/add-user/add-user.component";
import { DetailUserComponent } from "../detail-user/detail-user.component";
import { Mo } from "src/app/shared/models/Projet.model";
import { ActionButton } from "src/app/shared/refactore/page-actions/page-actions.component";

@Component({
  selector: "app-molist",
  templateUrl: "./molist.component.html",
  styleUrl: "./molist.component.css",
})
export class MolistComponent implements OnInit, OnDestroy {

  // ── Breadcrumb ────────────────────────────────────────────────────────────
  breadCrumbItems = [
    { label: "Maitres d'ouvrages" },
    { label: "Liste", active: true },
  ];

  // ── Page actions (bouton "Ajouter") ───────────────────────────────────────
  pageActions: ActionButton[] = [
    {
      label: "Ajouter un maître d'ouvrage",
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

  private destroy$ = new Subject<void>();
  private currentProjectId: number;

  constructor(
    private snackbar: SnackBarService,
    private coreService: CoreService,
    private localService: LocalService,
    private parentService: ServiceParent,
    private cd: ChangeDetectorRef,
  ) {
    this.currentProjectId = +this.localService.getData("ProjectId");
  }

  ngOnInit(): void {
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.fetchMo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────
  fetchMo(): void {
    this.loadData = true;
    this.parentService
      .list(
        `users/by_role/projects?roleName=Maitre d'ouvrage&projectId=${this.currentProjectId}`,
        this.pageSize,
        this.pageIndex
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
    if (!searchValue) {
      this.dataSource.filter = '';
      return;
    }
    this.dataSource.filterPredicate = (data: Mo, filter: string) =>
      [data.email, data.contact, data.locality, data.lastname]
        .some(v => v?.toLowerCase().includes(filter));
    this.dataSource.filter = searchValue.toLowerCase();
  }

  // ── Page action handler ───────────────────────────────────────────────────
  handlePageAction(action: string): void {
    if (action === 'add') this.addItems();
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  pageChanged(event: any): void {
    this.pageIndex = event.pageIndex ?? 0;
    this.pageSize = event.pageSize ?? this.pageSize;
    this.fetchMo();
  }

  // ── CRUD modals ───────────────────────────────────────────────────────────
  addItems(): void {
    this.snackbar.openModal(AddMaitreOuvrageComponent, "45rem", "new", "38rem", this.datas, "", () => this.fetchMo());
  }

  updateItems(information: any): void {
    this.snackbar.openModal(AddUserComponent, "45rem", "edit", "38", information, "", () => this.fetchMo());
  }

  detailItems(information: any): void {
    this.snackbar.openModal(DetailUserComponent, "45rem", "edit", "38", information, "", () => this.fetchMo());
  }

  supprimerItems(id: any): void {
    this.snackbar.showConfirmation("Voulez-vous vraiment supprimer ce utilisateur?").then((result) => {
      if (result?.value === true) {
        this.coreService.deleteItem(id, "users/deleteMo").subscribe({
          next: (resp: any) => { if (resp?.responseCode === 200) this.fetchMo(); },
          error: (err) => this.snackbar.showErrors(err),
        });
      }
    });
  }

  // ── Table config ──────────────────────────────────────────────────────────
  createHeader() {
    return [
      { th: "Nom",               td: "lastname"  },
      { th: "Prénom",            td: "firstname" },
      { th: "Email",             td: "email"     },
      { th: "Numéro téléphone",  td: "contact"   },
    ];
  }

  createActions(): ButtonAction[] {
    return [
      { icon: "bxs-edit",        couleur: "green",    size: "icon-size-4", title: "Modifier",  isDisabled: false, action: (el) => this.updateItems(el)      },
      { icon: "bxs-trash-alt",   couleur: "#D45C00",  size: "icon-size-4", title: "Supprimer", isDisabled: false, action: (el) => this.supprimerItems(el.id) },
      { icon: "bxs-info-circle", couleur: "black",    size: "icon-size-4", title: "Détail",    isDisabled: false, action: (el) => this.detailItems(el)       },
    ];
  }
}