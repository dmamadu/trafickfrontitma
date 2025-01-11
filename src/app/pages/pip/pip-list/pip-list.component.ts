import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  ButtonAction,
  TableauComponent,
} from "src/app/shared/tableau/tableau.component";
import { UIModule } from "../../../shared/ui/ui.module";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { UntypedFormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DatePipe } from "@angular/common";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { TesterComponent } from "../../tester/tester.component";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import * as XLSX from "xlsx";
import { PipAddComponent } from "../pip-add/pip-add.component";
import { Pap, ResponsePap } from "../pip.model";
import { PapService } from "../pap.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { DatatableComponent } from "src/app/shared/datatable/datatable.component";
import { ToastrService } from "ngx-toastr";
import { SharedService } from "../../projects/shared.service";
import { LocalService } from "src/app/core/services/local.service";
import { CoreService } from "src/app/shared/core/core.service";

@Component({
  selector: "app-pip-list",
  templateUrl: "./pip-list.component.html",
  styleUrl: "./pip-list.component.css",
  standalone: true,
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
    AngularMaterialModule
],
})
export class PipListComponent implements OnInit {
  [x: string]: any;

  listPap: Pap[];
  filterTable($event: any) {
    throw new Error("Method not implemented.");
  }
  breadCrumbItems: Array<{}>;

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
  url: string = "partie-interesse";
  panelOpenState = false;
  img;
  image;
  privilegeByRole: any; //liste des codes recu de l'api lors de la connexion
  privilegeForPage: number = 2520; //code privilege envoye pour afficher la page
  privilegePage;
  headers: any = [];
  btnActions: any = [];
  lienBrute: string;
  lien: string;
  currentLang: string = "fr";

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private _router: Router,
    private datePipe: DatePipe,
    private snackbar: SnackBarService,
    private _matDialog: MatDialog,
    private papService: PapService,
    private parentService: ServiceParent,
    public matDialogRef: MatDialogRef<PipAddComponent>,
    private _changeDetectorRef: ChangeDetectorRef,
    public toastr: ToastrService,
    private sharedService: SharedService,
    private localService: LocalService,
    private route: ActivatedRoute,
    private router: Router,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Pap" },
      { label: "Pap List", active: true },
    ];
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    // if (this.privilegePage) {
    //   this.getList();
    // //  this.checkCodePrivilegeForRole();
    // }
    this.lienBrute = this.router.url;
    // Extraire une partie spécifique de l'URL
    this.lien = this.lienBrute.substring(1, this.lienBrute.length);
    console.log("URL modifiée:", this.lien);
    this.getPip();
    this.getCategoriePartieInteresses()
  }

  createHeader() {
    return [
      {
        th: "Libelle",
        td: "libelle",
      },
      {
        th: "Localisation",
        td: "localisation",
      },
      {
        th: "Statut",
        td: "statut",
      },
      {
        th: "Couriel Principal",
        td: "courielPrincipal",
      },
      {
        th: "Catégorie",
        td: "categoriePartieInteresse",
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
        couleur: "#00bfff",
        size: "icon-size-4",
        title: "détail",
        isDisabled: this.hasDelete,
        action: (element?) => this.detailItems(element.id, element),
      },
    ];
  }

  getPip() {
    this.loadData=true;

      if (this.lien === "pip/ong") {
        return this.parentService
          .liste("partie-interesse", this.pageSize, this.offset, "ONG")
          .subscribe(
            (data: any) => {
              this.loadData = false;
              if (data["responseCode"] == 200) {
                console.log(data);
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
      } else if (this.lien === "pip/organisation") {
        return this.parentService
          .liste("partie-interesse", this.pageSize, this.offset, "Organisations")
          .subscribe(
            (data: any) => {
              this.loadData = false;
              if (data["responseCode"] == 200) {
                console.log(data);
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
      } else if (this.lien === "pip/entreprise") {
        return this.parentService
          .liste("partie-interesse", this.pageSize, this.offset, "Entreprises")
          .subscribe(
            (data: any) => {
              this.loadData = false;
              if (data["responseCode"] == 200) {
                console.log(data);
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
      else if (this.lien === "pip/bailleurs") {
        return this.parentService
          .liste("partie-interesse", this.pageSize, this.offset, "Bailleurs")
          .subscribe(
            (data: any) => {
              this.loadData = false;
              if (data["responseCode"] == 200) {
                console.log(data);
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
      else if (this.lien === "pip/medias") {
        return this.parentService
          .liste("partie-interesse", this.pageSize, this.offset, "Médias")
          .subscribe(
            (data: any) => {
              this.loadData = false;
              if (data["responseCode"] == 200) {
                console.log(data);
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


    // return this.parentService
    //   .list("partie-interesse", this.pageSize, this.offset)
    //   .subscribe(
    //     (data: any) => {
    //       this.loadData = false;
    //       if (data["responseCode"] == 200) {
    //         console.log(data);
    //         this.loadData = false;
    //         console.log(data);
    //         this.dataSource = new MatTableDataSource(data["data"]);
    //         this.dataSource.paginator = this.paginator;
    //         this.dataSource.sort = this.sort;
    //         this.datas = data["data"];
    //         this.length = data["length"];
    //         console.log("length", this.length);
    //         this._changeDetectorRef.markForCheck();
    //       } else {
    //         this.loadData = false;
    //         this.dataSource = new MatTableDataSource();
    //       }
    //     },
    //     (err) => {
    //       console.log(err);
    //     }
    //   );
  }

  pageChanged(event) {
    console.log(event);
    this.datas = [];
    this._changeDetectorRef.markForCheck();
    console.log(event.pageIndex);
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.offset = this.pageIndex;
    this.getPap();
  }

  updateItems(information): void {
    this.snackbar.openModal(
      PipAddComponent,
      "50rem",
      "edit",
      "",
      information,
      "",
      () => {
        this.getPip();
      }
    );
  }

  //cette fonction permet de supprimer
  supprimerItems(id, information) {
    console.log("====================================");
    console.log(information.categoriePartieInteresse);
    console.log("====================================");
    this.snackbar
      .showConfirmation(
        `Voulez-vous vraiment supprimer ce ${this.getCategorie(
          information.categoriePartieInteresse
        )}?  `
      )
      .then((result) => {
        if (result["value"] == true) {
          this.deleteUser = true;
          this.currentIndex = information;
          this.showLoader = "isShow";
          const message = "supprimé avec succés";
          this.coreService.deleteItem(id, this.url).subscribe(
            (resp) => {
              this.showLoader = "isNotShow";
              console.log(resp);
              this.getPip();
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
      PipAddComponent,
      "55rem",
      "new",
      "",
      this.datas,
      "",
      () => {
        this.getPip();
      }
    );
  }

  convertedJson: string;

  fileUpload(event: any) {
    console.log(event.target.files);
    const selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFile);
    fileReader.onload = (event: any) => {
      console.log(event);
      let binaryData = event.target.result;
      let workbook = XLSX.read(binaryData, { type: "binary" });
      console.log("====================================");
      console.log(workbook);
      console.log("====================================");
      workbook.SheetNames.forEach((sheet) => {
        const worksheet = workbook.Sheets[sheet];
        const data: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];
        const headers = data[0];
        console.log("Headers:", headers);
        this.headings = headers;
        const jsonData = data.slice(1).map((row: any[]) => {
          let obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index];
          });
          return obj;
        });
        this.dataExcel = jsonData;
        //this.convertedJson = JSON.stringify(jsonData, undefined, 4);
      });
    };
  }

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

  detailItems(id, information) {
    console.log(information);

    this.localService.saveDataJson("pap", information);
    this.sharedService.setSelectedItem(information);
    this._router.navigate(["pip/detail"]);
  }

  getCategoriePartieInteresses() {
    this.coreService.list("categoriesPip", 0, 10000).subscribe((response) => {
      if (response["responseCode"] === 200) {
        this.categoriePartieInteresses = response["data"];
        console.log("====================================");
        console.log(this.categoriePartieInteresses);
        console.log("====================================");
        this.changeDetectorRefs.markForCheck();
      }
    });
  }
  getCategorie(value: any) {
    if (this.categoriePartieInteresses) {
      const liste = this.categoriePartieInteresses.filter(
        (type) => type.id == value
      );
      return liste.length != 0 ? liste[0]?.libelle : value;
    }
  }
}
