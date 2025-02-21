import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import {
  ButtonAction,
  TableauComponent,
} from "src/app/shared/tableau/tableau.component";
import { UIModule } from "../../../shared/ui/ui.module";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { FormsModule, UntypedFormGroup } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { DatatableComponent } from "src/app/shared/datatable/datatable.component";
import { ToastrService } from "ngx-toastr";
import { LocalService } from "src/app/core/services/local.service";
import { CoreService } from "src/app/shared/core/core.service";
import { ExportService } from "src/app/shared/core/export.service";
import { Pap } from "../../pap/pap.model";
import { PapService } from "../../pap/pap.service";
import { PapAgricoleComponent } from "../../pap/pap-agricole/pap-agricole.component";
import { DetailBaremeComponent } from "../detail-bareme/detail-bareme.component";
import { AddBaremeOperateurEconomiqueComponent } from "../bareme-pap-operateur-economique/add-bareme-operateur-economique/add-bareme-operateur-economique.component";

@Component({
  selector: 'app-bareme-revenue',
  standalone: true,
  providers: [
        DatePipe,
        {
          provide: MatDialogRef,
          useValue: [],
        },
        DatePipe,
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatPaginatorIntl },
        {
          provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
          useValue: { appearance: "outline" },
        },
        ExportService,
      ],
      imports: [
        TableauComponent,
        UIModule,
        AngularMaterialModule,
        DatatableComponent,
        FormsModule,
      ],
  templateUrl: './bareme-revenue.component.html',
  styleUrl: './bareme-revenue.component.css'
})
export class BaremeRevenueComponent {

   [x: string]: any;

      listPap: Pap[];
      filterTable($event: any) {}
      breadCrumbItems: Array<{}>;
      @ViewChild(MatSort) sort: MatSort;
      @ViewChild(MatPaginator) paginator: MatPaginator;
      informations: any;
      displayedColumns: any;
      searchList: any;
      hasList: boolean;
      hasUpdate: boolean;
      length = 100;
      dialogRef: any;
      dataSource: MatTableDataSource<any>;
      datas = [];
      isLoading: boolean = false;
      pageSizeOptions = [5, 10, 25, 100, 500, 1000];
      pageSize: number = 10;
      pageIndex: number = 0;
      //constantes = CONSTANTES;
      userConnecter;
      offset: number = 0;
      title: string = "Gestion des partis affectés";
      url: string = "baremeEquipement";
      panelOpenState = false;
      img;

      image;
      headers: any = [];
      btnActions: any = [];
      currentUser: any;

      constructor(
        private changeDetectorRefs: ChangeDetectorRef,
        private snackbar: SnackBarService,
        private papService: PapService,
        private parentService: ServiceParent,
        public matDialogRef: MatDialogRef<PapAgricoleComponent>,
        private _changeDetectorRef: ChangeDetectorRef,
        public toastr: ToastrService,
        private localService: LocalService,
        private coreService: CoreService
      ) {
        this.currentUser = this.localService.getDataJson("user");

        console.log("user connecter", this.currentUser);

       // this.displayedColumns = this.informations.tabBody;
      }

      selectedOption: string = "";
      ngOnInit(): void {
        console.log("Valeur sélectionnée :", this.selectedOption);
        this.breadCrumbItems = [
          { label: "Pap" },
          { label: "Pap List", active: true },
        ];
        this.getBaremeEquipement();
        this.headers = this.createHeader();
        this.btnActions = this.createActions();
      }

      createHeader() {
        return [
          {
            th: "Catégorie équipements",
            td: "categorie",
          },
          {
            th: "Prix ",
            td: "prixUnite",
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
            action: (element?) => this.detailItems(element),
          },
        ];
      }

      getBaremeEquipement() {
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

      pageChanged(event) {
        console.log(event);
        this.datas = [];
        this._changeDetectorRef.markForCheck();
        console.log(event.pageIndex);
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.offset = this.pageIndex;
        this.getBaremeEquipement();
      }

      updateItems(information): void {
        console.log(information);
        this.snackbar.openModal(
          AddBaremeOperateurEconomiqueComponent,
          "50rem",
          "edit",
          "",
          information,
          "",
          () => {
            this.getList();
          }
        );
      }

      //cette fonction permet de supprimer
      supprimerItems(id, information) {
        this.snackbar
          .showConfirmation("Voulez-vous vraiment supprimer ce bareme ?")
          .then((result) => {
            if (result["value"] == true) {
              this.deleteUser = true;
              this.currentIndex = information;
              this.showLoader = "isShow";
              const message = "Bareme  supprimé";
              this.coreService.deleteItem(id, this.url).subscribe(
                (resp) => {
                  this.showLoader = "isNotShow";
                  this.coreService
                    .list(this.url, this.offset, this.pageSize)
                    .subscribe((resp: any) => {
                      const data = resp["data"] || resp;
                      this.dataSource = new MatTableDataSource(data);
                      this.dataSource.paginator = this.paginator;
                      this.dataSource.sort = this.sort;
                      this.deleteUser = false;
                      this.datas = resp["data"] || data;
                      this.length = resp["total"] || data.length;
                      this.changeDetectorRefs.markForCheck();
                      this.changeDetectorRefs.detectChanges();
                      this.snackbar.openSnackBar(message + " avec succès", "OK", [
                        "mycssSnackbarGreen",
                      ]);
                    });
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

      filterList() {
        this.isCollapsed = !this.isCollapsed;
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
        this.loadData = true;
        const dataToSend = this.dataExcel.map((item) => ({
          ...item,
          projectId: +this.currentUser.projects[0]?.id,
        }));

        console.log(dataToSend);
        return this.papService.add(this.url, dataToSend).subscribe(
          (data: any) => {
            console.log(data);
            this.toastr.success(data.message);
            this.dataExcel = [];
            this.getBaremeEquipement();
            this.loadData = false;
          },
          (err) => {
            this.loadData = false;
            this.toastr.error(err);
          }
        );
      }

      importDatas(params: string) {
        return this.papService.add(`${this.url} `, this.dataExcel).subscribe(
          (data: any) => {
            console.log(data);
            this.toastr.success(data.message);
            this.selectedOption = "";
            this.resetDataFromExcel();
          },
          (err) => {
            console.log(err);
            this.toastr.error(err);
            this.resetDataFromExcel();
          }
        );
      }


      detailItems(information): void {
        console.log(information);
        this.snackbar.openModal(
          DetailBaremeComponent,
          "45rem",
          "",
          "38rem",
          information,
          "",
          () => {
            this.getTaches();
          }
        );
      }

}
