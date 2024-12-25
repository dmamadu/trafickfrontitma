import { CommonModule, DatePipe } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from "@angular/material/form-field";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
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
import { CreatetaskComponent } from "../createtask/createtask.component";
import { MatNativeDateModule, MatOptionModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { NgApexchartsModule } from "ng-apexcharts";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ModalModule } from "ngx-bootstrap/modal";
import { DndModule } from "ngx-drag-drop";
import { TasksRoutingModule } from "../tasks-routing.module";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.css",
  standalone: true,
  providers: [
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
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UIModule,
    NgApexchartsModule,
    CKEditorModule,
    DndModule,
    AngularMaterialModule,
    MatDialogModule,
    MatSelectModule,
    MatOptionModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class ListTacheComponent implements OnInit {
  getImageFromBase64(arg0: any, arg1: any): any {
    throw new Error("Method not implemented.");
  }
  breadCrumbItems: (
    | { label: string; active?: undefined }
    | { label: string; active: boolean }
  )[];
  DetailProject: any;
  filterTable($event: any) {
    throw new Error("Method not implemented.");
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  informations: any;
  displayedColumns: any;
  searchList: any;
  codeEnvoye: number; //code envoye par notre menu
  hasList: boolean;
  hasAdd: boolean;
  hasUpdate: boolean;
  hasDelete: boolean;
  hasDetail: boolean;
  length = 100;
  searchForm: UntypedFormGroup;
  dialogRef: any;
  dataSource: MatTableDataSource<any>;
  datas = [];
  deleteUser: boolean = false;
  currentIndex;
  loadData: boolean = false;
  exporter: boolean = false;
  isCollapsed: boolean = false;
  isSearch2: boolean = false;
  isSearch: boolean = false;
  rechercher = "";
  showLoader = "isNotShow";
  message = "";
  config: any;
  isLoading: boolean = false;
  pageSizeOptions = [5, 10, 25, 100, 500, 1000];
  pageSize: number = 10;
  pageIndex: number = 0;
  //constantes = CONSTANTES;
  userConnecter;
  offset: number = 0;
  title: string = "Gestion des produits";
  url: string = "taches";
  panelOpenState = false;
  img;
  image;
  privilegeByRole: any; //liste des codes recu de l'api lors de la connexion
  privilegeForPage: number = 2520; //code privilege envoye pour afficher la page
  privilegePage;
  headers: any = [];
  btnActions: any = [];


  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private _router: Router,
    private datePipe: DatePipe,
    private snackbar: SnackBarService,
    private _matDialog: MatDialog,
    private papService: PapService,
    private parentService: ServiceParent,
    public matDialogRef: MatDialogRef<PapAddComponent>,
    private _changeDetectorRef: ChangeDetectorRef,
    public toastr: ToastrService,
    private sharedService: SharedService,
    private localService: LocalService,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.getTaches();
    // this.getConsultant();

    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    // if (this.privilegePage) {
    //   this.getList();
    // //  this.checkCodePrivilegeForRole();

    // }
    this.breadCrumbItems = [
      { label: "Taches" },
      { label: "Liste des taches", active: true },
    ];
  }

  createHeader() {
    return [
      {
        th: "Libelle",
        td: "libelle",
      },
      {
        th: "Description",
        td: "description",
      },
      {
        th: "Etat",
        td: "statut",
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
        couleur: "text-red-400",
        size: "icon-size-4",
        title: "détail",
        isDisabled: this.hasDelete,
        action: (element?) => this.detailItems(element.id, element),
      },
    ];
  }

  getTaches() {
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
    this.getTaches();
  }

  // updateItems(information): void {
  //   console.log(information);

  //   this.localService.saveDataJson("tacheToUpdate", information);
  //   this._router.navigate(["tasks/create"]);
  // }

  //cette fonction permet de supprimer
  supprimerItems(id, information) {
    console.log("====================================");
    console.log(id);
    console.log("====================================");
    this.snackbar
      .showConfirmation("Voulez-vous vraiment supprimer cette tache?")
      .then((result) => {
        if (result["value"] == true) {
          this.deleteUser = true;
          this.currentIndex = information;
          this.showLoader = "isShow";
          const message = "tache  supprimé";
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
              if (resp["200"]) {
                this.getTaches();
              }
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

  //cette fonction permet d'exporter la liste sous format excel ou pdf
  exportAs(format) {
    const nom = "Liste des produits";
    let value = [];
    // this.coreService.list(this.url, 0, 1000000000).subscribe((resp) => {
    //     if (resp['responseCode'] == this.constantes.HTTP_STATUS.SUCCESSFUL) {
    //         value = resp['data'];
    //         if (value.length != 0) {
    //             const user = this.coreService.decriptDataToLocalStorage('CD-@--5');
    //             if (format == 'pdf') {
    //                 const donne = this.exempleGenPdfHeaderFooter(user.firstName + ' ' + user.lastName, nom);
    //                 const doc = donne.doc;
    //                 let col = this.informations.tabFileHead;
    //                 let rows = [];
    //                 let itemCurrent;
    //                 for (let item of value) {
    //                     itemCurrent = item;
    //                     const tabField = [];
    //                     const elementKeys = Object.keys(item);
    //                     let i = 0;
    //                     for (const field of this.informations.tabFileBody) {
    //                         for (const element of elementKeys) {
    //                             if (field == element) {
    //                                 if (field == 'createdAt' || field == 'dateNaiss' || field == 'dateCirculation' || field == 'dateDepart' || field == 'dateDarriver' || field == 'date' || field == 'dateDebut' || field == 'dateFin' || field == 'dateCreated') {
    //                                     tabField.push(moment(itemCurrent[field]).format('DD/MM/YYYY') || '');
    //                                 } else {
    //                                     if (typeof itemCurrent[field] == 'object') {
    //                                         tabField.push(!(itemCurrent[field] instanceof Object) ? itemCurrent[field] : itemCurrent[field]['libelle'] ? itemCurrent[field]['libelle'] : itemCurrent[field]['code'] ? itemCurrent[field]['code'] : itemCurrent[field]['intituleClient'] ? itemCurrent[field]['intituleClient'] : itemCurrent[field]['nom']);
    //                                     } else {
    //                                         tabField.push(itemCurrent[field] || '');
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                         i++;
    //                     }
    //                     rows.push(tabField);
    //                 }
    //                 autoTable(doc, {head: [col], body: rows});
    //                 doc.save(nom + '.pdf');
    //                 this.snackbar.openSnackBar('Téléchargement réussi', 'OK', ['mycssSnackbarGreen']);
    //                 this.exporter = false;
    //             } else if (format == 'excel') {
    //                 let rows = [];
    //                 let itemCurrent;
    //                 for (let item of value) {
    //                     itemCurrent = item;
    //                     const tabField = [];
    //                     const elementKeys = Object.keys(item);
    //                     let i = 0;
    //                     for (const field of this.informations.tabFileBody) {
    //                         for (const element of elementKeys) {
    //                             if (element.toString() == field.toString()) {
    //                                 if (field == 'createdAt' || field == 'dateNaiss' || field == 'dateCirculation' || field == 'dateDepart' || field == 'dateDarriver' || field == 'date' || field == 'dateDebut' || field == 'dateFin' || field == 'dateCreated') {
    //                                     tabField.push({[this.informations.tabFileHead[i]]: (moment(itemCurrent[field]).format('DD/MM/YYYY') || '')});
    //                                 } else {
    //                                     if (typeof itemCurrent[field] == 'object') {
    //                                         tabField.push({[this.informations.tabFileHead[i]]: (!(itemCurrent[field] instanceof Object) ? itemCurrent[field] : itemCurrent[field]['libelle'] ? itemCurrent[field]['libelle'] : itemCurrent[field]['code'] ? itemCurrent[field]['code'] : itemCurrent[field]['intituleClient'] ? itemCurrent[field]['intituleClient'] : itemCurrent[field]['nom'])});
    //                                     } else {
    //                                         tabField.push({[this.informations.tabFileHead[i]]: (itemCurrent[field] || '')});
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                         i++;
    //                     }
    //                     rows.push(Object.assign({}, ...tabField));
    //                 }
    //                 this.exportService.exportAsExcelFile(this.exportService.preFormatLoanInfo(rows), nom);
    //                 this.snackbar.openSnackBar('Téléchargement réussi', 'OK', ['mycssSnackbarGreen']);
    //                 this.exporter = false;
    //             }
    //         } else {
    //             this.snackbar.openSnackBar('La liste est vide!!!', 'OK', ['mycssSnackbarRed']);
    //         }
    //     } else {
    //         this.loadData = false;
    //     }
    // }, (error) => {
    //     this.snackbar.showErrors(error);
    // });
  }

  exempleGenPdfHeaderFooter(userName, fileName) {
    //     const toDay = new Date();
    //     let marginX = 0;
    //     const doc = new jsPDF();
    //     const totalPagesExp = '{total_pages_count_string}';
    //     doc.setFillColor(0, 0, 255);
    //     const columns = ['                     ', fileName, 'Créé par ' + userName + ' le :' + this.datePipe.transform(toDay, 'dd/MM/yyyy')];
    //     const rows = [];
    //     autoTable(doc, {
    //         head: [columns],
    //         body: rows,
    //         theme: 'grid',
    //         margin: {
    //             top: 10
    //         },
    //         didDrawCell: function (data) {
    //             if (
    //                 (data.row.section === 'head') &&
    //                 data.column.index === 1
    //             ) {
    //                 data.cell.styles.textColor = [51, 122, 183];
    //                 data.cell.styles.fontSize = 12;
    //                 data.cell.styles.valign = 'middle';
    //                 data.cell.styles.fillColor = [216, 78, 75];
    //             }
    //             if (
    //                 (data.row.section === 'head') &&
    //                 data.column.index === 0
    //             ) {
    //                 doc.addImage(logo, 'JPEG', data.cell.x + 2, data.cell.y + 2, 30, 15);
    //             }
    //         },
    //         didDrawPage: function (data) {
    //             marginX = data.settings.margin.left;
    //             // Header
    //             doc.setFontSize(12);
    //             doc.setTextColor(255);
    //         },
    //         styles: {
    //             lineColor: [0, 0, 0],
    //             lineWidth: 0.3,
    //             textColor: [51, 122, 183],
    //         },
    //         headStyles: {
    //             fillColor: [255, 255, 255],
    //             fontSize: 10,
    //             fontStyle: 'normal',
    //             valign: 'middle',
    //             textColor: 0,
    //             minCellHeight: 20,
    //         },
    //         willDrawCell: function (data) {
    //             if (data.row.section === 'head') {
    //                 doc.setTextColor(51, 122, 183);
    //             }
    //             if (data.row.section === 'head' && data.column.index === 1) {
    //                 doc.setFontSize(12);
    //             }
    //         },
    //     });
    //     return {doc: doc, marginX: marginX, totalPagesExp: totalPagesExp};
    // }
    // rechercherGlobal(event?) {
    //     this.rechercher = event;
    //     if (this.rechercher !== '') {
    //         const data = {
    //             'isGlobal': true,
    //             'typeEntity': this.url,
    //             'searchQuery': this.rechercher
    //         };
    //         this.isSearch = true;
    //         this.coreService.doRechercher(data, this.url).subscribe(response => {
    //             this.isSearch = false;
    //             this.datas = response['list'];
    //             this.dataSource = new MatTableDataSource(this.datas);
    //             this.changeDetectorRefs.markForCheck();
    //             this.length = response['total'];
    //             this.isSearch = false;
    //         });
    //     } else {
    //         this.getList();
    //     }
  }

  record(item) {}

  addItems(): void {
    this.snackbar.openModal(
      CreatetaskComponent,
      "55rem",
      "new",
      "auto",
      this.datas,
      "",
      () => {
        this.getTaches();
      }
    );

    //   this._router.navigate(['tasks/create']);
  }



  updateItems(information): void {
    console.log(information);
    this.snackbar.openModal(
      CreatetaskComponent,
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
          this.getTaches();
        },
        (err) => {
          this.toastr.error(err);
        }
      );
  }

  detailItems(id, information) {
    console.log(information);
    this.localService.saveDataJson("task", information);
    this.sharedService.setSelectedItem(information);
    this._router.navigate(["tasks/list"]);
  }

  getConsultant() {
    return this.papService.all("users/by_role?roleName=Consultant").subscribe(
      (data: any) => {
        this.loadData = false;
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
