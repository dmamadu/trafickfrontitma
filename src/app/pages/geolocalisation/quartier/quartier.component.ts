import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  ViewChild,
} from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ButtonAction, TableauComponent } from "src/app/shared/tableau/tableau.component";
import { UIModule } from "src/app/shared/ui/ui.module";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { AddQuartierComponent } from "./add-quartier/add-quartier.component";

@Component({
  selector: "app-quartier",
  standalone: true,
  imports: [TableauComponent, UIModule, AngularMaterialModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./quartier.component.html",
  styleUrl: "./quartier.component.css",
})
export class QuartierComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  datas: any[] = [];
  headers: any[] = [];
  btnActions: any[] = [];
  dataSource: MatTableDataSource<any>;
  searchForm: UntypedFormGroup;

  loadData = false;
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  offset = 0;
  pageSizeOptions = [5, 10, 25, 50, 100];

  constructor(
    private parentService: ServiceParent,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.headers = this.createHeaders();
    this.btnActions = this.createActions();
    this.getQuartiers();
  }

  createHeaders() {
    return [
      { th: "Nom", td: "nom" },
      { th: "Latitude centre", td: "latitudeCentre" },
      { th: "Longitude centre", td: "longitudeCentre" },
      { th: "Nombre de points", td: "nombrePoints" },
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
        action: (element?) => this.updateItems(element),
      },
      {
        icon: "bxs-trash-alt",
        couleur: "#D45C00",
        size: "icon-size-4",
        title: "Supprimer",
        isDisabled: false,
        action: (element?) => this.supprimerItems(element?.id, element),
      },
    ];
  }

  getQuartiers() {
    this.loadData = true;
    this.parentService.list("geolocation/quartiers", this.pageSize, this.offset).subscribe(
      (data: any) => {
        this.loadData = false;
        if (data["responseCode"] === 200) {
          this.datas = data["data"];
          this.length = data["length"];
          this._changeDetectorRef.markForCheck();
        }
      },
      () => {
        this.loadData = false;
        this._changeDetectorRef.markForCheck();
      }
    );
  }

  addItems(): void {
    this.snackbar.openModal(AddQuartierComponent, "40rem", "new", "", null, "", () => {
      this.getQuartiers();
    });
  }

  updateItems(element: any): void {
    this.snackbar.openModal(AddQuartierComponent, "40rem", "edit", "", element, "", () => {
      this.getQuartiers();
    });
  }

  supprimerItems(id: number, element: any): void {
    this.snackbar.showConfirmation("Voulez-vous vraiment supprimer ce quartier ?").then((result) => {
      if (result["value"] === true) {
        this.coreService.deleteItem(id, "geolocation/quartiers").subscribe(
          (resp: any) => {
            if (resp["responseCode"] === 200) {
              this.snackbar.openSnackBar("Quartier supprimé avec succès", "OK", ["mycssSnackbarGreen"]);
              this.getQuartiers();
            } else {
              this.snackbar.openSnackBar(resp["message"], "OK", ["mycssSnackbarRed"]);
            }
          },
          (error) => this.snackbar.showErrors(error)
        );
      }
    });
  }

  pageChanged(event: any): void {
    this.pageSize = event.pageSize;
    this.offset = event.pageIndex;
    this.datas = [];
    this._changeDetectorRef.markForCheck();
    this.getQuartiers();
  }
}
