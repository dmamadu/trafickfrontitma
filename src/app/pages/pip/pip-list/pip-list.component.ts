// import {
//   ChangeDetectorRef,
//   Component,
//   inject,
//   OnInit,
//   ViewChild,
// } from "@angular/core";
// import {
//   ButtonAction,
//   TableauComponent,
// } from "src/app/shared/tableau/tableau.component";
// import { UIModule } from "../../../shared/ui/ui.module";
// import { MatTableDataSource } from "@angular/material/table";
// import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
// import { MatSort } from "@angular/material/sort";
// import { UntypedFormGroup } from "@angular/forms";
// import { Router } from "@angular/router";
// import { DatePipe } from "@angular/common";
// import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
// import { SnackBarService } from "src/app/shared/core/snackBar.service";
// import {
//   MAT_DIALOG_DATA,
//   MatDialog,
//   MatDialogRef,
// } from "@angular/material/dialog";
// import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
// import * as XLSX from "xlsx";
// import { PipAddComponent } from "../pip-add/pip-add.component";
// import { Pap } from "../pip.model";
// import { ServiceParent } from "src/app/core/services/serviceParent";
// import { ToastrService } from "ngx-toastr";
// import { SharedService } from "../../projects/shared.service";
// import { LocalService } from "src/app/core/services/local.service";
// import { CoreService } from "src/app/shared/core/core.service";

// @Component({
//   selector: "app-pip-list",
//   templateUrl: "./pip-list.component.html",
//   styleUrl: "./pip-list.component.css",
//   standalone: true,
//   providers: [
//     DatePipe,
//     {
//       provide: MatDialogRef,
//       useValue: [],
//     },
//     { provide: MAT_DIALOG_DATA, useValue: {} },
//     { provide: MatPaginatorIntl },
//     {
//       provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
//       useValue: { appearance: "outline" },
//     },
//   ],
//   imports: [
//     TableauComponent,
//     UIModule,
//     AngularMaterialModule
// ],
// })
// export class PipListComponent implements OnInit {
//   [x: string]: any;

//   listPap: Pap[];
//   filterTable($event: any) {
//     throw new Error("Method not implemented.");
//   }
//   breadCrumbItems: Array<{}>;

//   @ViewChild(MatSort) sort: MatSort;
//   @ViewChild(MatPaginator) paginator: MatPaginator;
//   informations: any;
//   displayedColumns: any;
//   searchList: any;
//   codeEnvoye: number; //code envoye par notre menu
//   hasList: boolean;
//   hasAdd: boolean;
//   hasUpdate: boolean;
//   hasDelete: boolean;
//   hasDetail: boolean;
//   length = 100;
//   searchForm: UntypedFormGroup;
//   dialogRef: any;
//   dataSource: MatTableDataSource<any>;
//   datas = [];
//   deleteUser: boolean = false;
//   currentIndex;
//   loadData: boolean = false;
//   exporter: boolean = false;
//   isCollapsed: boolean = false;
//   isSearch2: boolean = false;
//   isSearch: boolean = false;
//   rechercher = "";
//   showLoader = "isNotShow";
//   message = "";
//   config: any;
//   isLoading: boolean = false;
//   pageSizeOptions = [5, 10, 25, 100, 500, 1000];
//   pageSize: number = 10;
//   pageIndex: number = 0;
//   //constantes = CONSTANTES;
//   userConnecter;
//   offset: number = 0;
//   title: string = "Gestion des produits";
//   url: string = "partie-interesse";
//   panelOpenState = false;
//   img;
//   image;
//   privilegeByRole: any; //liste des codes recu de l'api lors de la connexion
//   privilegeForPage: number = 2520; //code privilege envoye pour afficher la page
//   privilegePage;
//   headers: any = [];
//   btnActions: any = [];
//   lienBrute: string;
//   lien: string;
//   currentLang: string = "fr";

//   constructor(
//     private changeDetectorRefs: ChangeDetectorRef,
//     private _router: Router,
//     private snackbar: SnackBarService,
//     private parentService: ServiceParent,
//     public matDialogRef: MatDialogRef<PipAddComponent>,
//     private _changeDetectorRef: ChangeDetectorRef,
//     public toastr: ToastrService,
//     private sharedService: SharedService,
//     private localService: LocalService,
//     private router: Router,
//     private coreService: CoreService
//   ) {}

//   // ngOnInit(): void {
//   //   this.breadCrumbItems = [
//   //     { label: "Pap" },
//   //     { label: "Pap List", active: true },
//   //   ];
//   //   this.headers = this.createHeader();
//   //   this.btnActions = this.createActions();
//   //   this.lienBrute = this.router.url;
//   //   this.lien = this.lienBrute.substring(1, this.lienBrute.length);
//   //   console.log("URL modifiée:", this.lien);
//   //   this.getPip();
//   //   this.getCategoriePartieInteresses()
//   // }

//   ngOnInit(): void {
//   this.breadCrumbItems = [
//     { label: "Pap" },
//     { label: "Pap List", active: true },
//   ];

//   this.generateAlphabet(); // 🔥 IMPORTANT

//   this.headers = this.createHeader();
//   this.btnActions = this.createActions();

//   this.getPip();
//   this.getCategoriePartieInteresses();
// }

//   createHeader() {
//     return [
//       {
//         th: "Libelle",
//         td: "libelle",
//       },
//       {
//         th: "Localisation",
//         td: "localisation",
//       },
//       {
//         th: "Statut",
//         td: "statut",
//       },
//       {
//         th: "Couriel Principal",
//         td: "courrielPrincipal",
//       },
//       {
//         th: "Catégorie",
//         td: "categorie",
//       },
//     ];
//   }

//   createActions(): ButtonAction[] {
//     return [
//       {
//         icon: "bxs-edit",
//         couleur: "green",
//         size: "icon-size-4",
//         title: "Modifier",
//         isDisabled: this.hasUpdate,
//         action: (element?) => this.updateItems(element),
//       },
//       {
//         icon: "bxs-trash-alt",
//         couleur: "#D45C00",
//         size: "icon-size-4",
//         title: "Supprimer",
//         isDisabled: this.hasDelete,
//         action: (element?) => this.supprimerItems(element.id, element),
//       },
//       {
//         icon: "bxs-info-circle",
//         couleur: "black",
//         size: "icon-size-4",
//         title: "détail",
//         isDisabled: this.hasDelete,
//         action: (element?) => this.detailItems(element.id, element),
//       },
//     ];
//   }


//   generateAlphabet() {
//   this.alphabet = Array.from({ length: 26 }, (_, i) =>
//     String.fromCharCode(65 + i)
//   );
// }

// groupByLetter() {
//   this.groupedData = {};

//   this.datas.forEach((item :any) => {
//     const letter = item?.libelle
//       ? item.libelle.charAt(0).toUpperCase()
//       : "#";

//     if (!this.groupedData[letter]) {
//       this.groupedData[letter] = [];
//     }

//     this.groupedData[letter].push(item);
//   });
// }

// scrollTo(letter: string) {
//   const el = document.getElementById(letter);
//   if (el) {
//     el.scrollIntoView({ behavior: "smooth" });
//   }
// }

//   getPip() {
//   this.loadData = true;
//   this.parentService
//     .list("partie-interesse", 10000, 0)
//     .subscribe(
//       (data: any) => {
//         this.loadData = false;

//         if (data["responseCode"] === 200) {
//           this.datas = data["data"] || [];
//           this.length = data["length"];

//           // 🔥 tri propre
//           this.datas.sort((a, b) =>
//             (a.libelle || "").localeCompare(b.libelle || "")
//           );

//           // 🔥 transformation A → Z
//           this.groupByLetter();
//         } else {
//           this.datas = [];
//         }

//         this._changeDetectorRef.markForCheck();
//       },
//       (err) => {
//         console.log(err);
//         this.loadData = false;
//       }
//     );
// }

//   pageChanged(event) {
//     console.log(event);
//     this.datas = [];
//     this._changeDetectorRef.markForCheck();
//     console.log(event.pageIndex);
//     this.pageSize = event.pageSize;
//     this.pageIndex = event.pageIndex;
//     this.offset = this.pageIndex;
//     this.getPap();
//   }

//   updateItems(information): void {
//     this.snackbar.openModal(
//       PipAddComponent,
//       "45rem",
//       "edit",
//       "",
//       information,
//       "",
//       () => {
//         this.getPip();
//       }
//     );
//   }

//   //cette fonction permet de supprimer
//   supprimerItems(id, information) {
//     this.snackbar
//       .showConfirmation(
//         `Voulez-vous vraiment supprimer ce ${this.getCategorie(
//           information.categoriePartieInteresse
//         )}?  `
//       )
//       .then((result) => {
//         if (result["value"] == true) {
//           this.deleteUser = true;
//           this.currentIndex = information;
//           this.showLoader = "isShow";
//           const message = "supprimé avec succés";
//           this.coreService.deleteItem(id, this.url).subscribe(
//             (resp) => {
//               this.showLoader = "isNotShow";
//               console.log(resp);
//               this.getPip();
//             },
//             (error) => {
//               this.showLoader = "isNotShow";
//               this.deleteUser = false;
//               this.snackbar.showErrors(error);
//             }
//           );
//         }
//       });
//   }

//   filterList() {
//     this.isCollapsed = !this.isCollapsed;
//   }

//   //cette fonction permet d'exporter la liste sous format excel ou pdf
//   exportAs(format) {
//     const nom = "Liste des produits";
//     let value = [];

//   }

//   exempleGenPdfHeaderFooter(userName, fileName) {

//   }

//   record(item) {}

//   addItems(): void {
//     this.snackbar.openModal(
//       PipAddComponent,
//       "45rem",
//       "new",
//       "40rem",
//       this.datas,
//       "",
//       () => {
//         this.getPip();
//       }
//     );
//   }

//   convertedJson: string;

//   fileUpload(event: any) {
//     console.log(event.target.files);
//     const selectedFile = event.target.files[0];
//     const fileReader = new FileReader();
//     fileReader.readAsBinaryString(selectedFile);
//     fileReader.onload = (event: any) => {
//       console.log(event);
//       let binaryData = event.target.result;
//       let workbook = XLSX.read(binaryData, { type: "binary" });
//       console.log("====================================");
//       console.log(workbook);
//       console.log("====================================");
//       workbook.SheetNames.forEach((sheet) => {
//         const worksheet = workbook.Sheets[sheet];
//         const data: any[][] = XLSX.utils.sheet_to_json(worksheet, {
//           header: 1,
//         }) as any[][];
//         const headers = data[0];
//         console.log("Headers:", headers);
//         this.headings = headers;
//         const jsonData = data.slice(1).map((row: any[]) => {
//           let obj: any = {};
//           headers.forEach((header: string, index: number) => {
//             obj[header] = row[index];
//           });
//           return obj;
//         });
//         this.dataExcel = jsonData;
//         //this.convertedJson = JSON.stringify(jsonData, undefined, 4);
//       });
//     };
//   }

//   headings = [];
//   dataExcel = [];

//   resetDataFromExcel() {
//     this.headings = [];
//     this.dataExcel = [];
//     this.convertedJson = "";
//   }

//   triggerFileUpload() {
//     const fileUploadElement = document.getElementById(
//       "file-upload"
//     ) as HTMLInputElement;
//     if (fileUploadElement) {
//       fileUploadElement.click();
//     }
//   }

//   detailItems(id, information) {
//     console.log(information);

//     this.localService.saveDataJson("pap", information);
//     this.sharedService.setSelectedItem(information);
//     this._router.navigate(["pip/detail"]);
//   }

//   getCategoriePartieInteresses() {
//     this.coreService.list("categoriesPip", 0, 10000).subscribe((response) => {
//       if (response["responseCode"] === 200) {
//         this.categoriePartieInteresses = response["data"];
//         console.log("====================================");
//         console.log(this.categoriePartieInteresses);
//         console.log("====================================");
//         this.changeDetectorRefs.markForCheck();
//       }
//     });
//   }
//   getCategorie(value: any) {
//     if (this.categoriePartieInteresses) {
//       const liste = this.categoriePartieInteresses.filter(
//         (type) => type.id == value
//       );
//       return liste.length != 0 ? liste[0]?.libelle : value;
//     }
//   }
// }

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
import { Router } from "@angular/router";
import { DatePipe } from "@angular/common";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import * as XLSX from "xlsx";
import { PipAddComponent } from "../pip-add/pip-add.component";
import { Pap } from "../pip.model";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { ToastrService } from "ngx-toastr";
import { SharedService } from "../../projects/shared.service";
import { LocalService } from "src/app/core/services/local.service";
import { CoreService } from "src/app/shared/core/core.service";
import { PipDetailModalComponent } from "./pip-detail-modal/pip-detail-modal.component";

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
  alphabet: string[] = [];
  groupedData: { [key: string]: any[] } = {};
  categoriePartieInteresses: any[] = [];

  filterTable($event: any) {
    throw new Error("Method not implemented.");
  }
  breadCrumbItems: Array<{}>;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  informations: any;
  displayedColumns: any;
  searchList: any;
  codeEnvoye: number;
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
  userConnecter;
  offset: number = 0;
  title: string = "Gestion des produits";
  url: string = "partie-interesse";
  panelOpenState = false;
  img;
  image;
  privilegeByRole: any;
  privilegeForPage: number = 2520;
  privilegePage;
  headers: any = [];
  btnActions: any = [];
  lienBrute: string;
  lien: string;
  currentLang: string = "fr";

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private _router: Router,
    private snackbar: SnackBarService,
    private parentService: ServiceParent,
    public matDialogRef: MatDialogRef<PipAddComponent>,
    private _changeDetectorRef: ChangeDetectorRef,
    public toastr: ToastrService,
    private sharedService: SharedService,
    private localService: LocalService,
    private router: Router,
    private coreService: CoreService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: "Pap" },
      { label: "Pap List", active: true },
    ];

    this.generateAlphabet();
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.getPip();
    this.getCategoriePartieInteresses();
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
        td: "courrielPrincipal",
      },
      {
        th: "Catégorie",
        td: "categorie",
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
        couleur: "#D45C00",
        size: "icon-size-4",
        title: "Supprimer",
        isDisabled: this.hasDelete,
        action: (element?) => this.supprimerItems(element.id, element),
      },
      {
        icon: "bxs-info-circle",
        couleur: "#D45C00",
        size: "icon-size-4",
        title: "Détail",
        isDisabled: false,
        action: (element?) => this.openDetailModal(element),
      },
    ];
  }

  generateAlphabet() {
    this.alphabet = Array.from({ length: 26 }, (_, i) =>
      String.fromCharCode(65 + i)
    );
  }

  groupByLetter() {
    this.groupedData = {};

    this.datas.forEach((item: any) => {
      const letter = item?.libelle
        ? item.libelle.charAt(0).toUpperCase()
        : "#";

      if (!this.groupedData[letter]) {
        this.groupedData[letter] = [];
      }

      this.groupedData[letter].push(item);
    });
  }

  scrollTo(letter: string) {
    const el = document.getElementById(letter);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  getPip() {
    this.loadData = true;
    this.parentService
      .list("partie-interesse", 10000, 0)
      .subscribe(
        (data: any) => {
          this.loadData = false;

          if (data["responseCode"] === 200) {
            this.datas = data["data"] || [];
            this.length = data["length"];

            this.datas.sort((a, b) =>
              (a.libelle || "").localeCompare(b.libelle || "")
            );

            this.groupByLetter();
          } else {
            this.datas = [];
          }

          this._changeDetectorRef.markForCheck();
        },
        (err) => {
          console.log(err);
          this.loadData = false;
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
    this.getPip();
  }

  updateItems(information): void {
    this.snackbar.openModal(
      PipAddComponent,
      "45rem",
      "edit",
      "",
      information,
      "",
      () => {
        this.getPip();
      }
    );
  }

  supprimerItems(id, information) {
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

  exportAs(format) {
    const nom = "Liste des produits";
    let value = [];
  }

  exempleGenPdfHeaderFooter(userName, fileName) {}

  record(item) {}

  addItems(): void {
    this.snackbar.openModal(
      PipAddComponent,
      "45rem",
      "new",
      "40rem",
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

  /**
   * Ouvre le modal de détail au lieu de naviguer
   */
  openDetailModal(information: any): void {
    console.log('Ouverture du modal de détail:', information);
    
    const dialogRef = this.dialog.open(PipDetailModalComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'pip-detail-modal',
      data: {
        pap: information,
        categoriePartieInteresses: this.categoriePartieInteresses
      }
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result === 'refresh') {
    //     this.getPip();
    //   }
    //   console.log('Modal fermé');
    // });
    dialogRef.afterClosed().subscribe(result => {
  if (result === 'refresh') {
    this.getPip();
  }
  if (result?.action === 'edit') {
    this.updateItems(result.data);
  }
});
  }

  /**
   * Ancienne méthode de détail - conservée pour compatibilité mais non utilisée
   */
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
    return value;
  }
}