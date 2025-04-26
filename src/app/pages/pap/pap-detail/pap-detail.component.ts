import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { MatDrawer, MatSidenavModule } from "@angular/material/sidenav";
import * as XLSX from "xlsx";

import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { CONSTANTES } from "src/app/shared/models/constantes";
import { ClientVueService } from "../../admin/client-vue/client-vue.service";
import { MatDialog } from "@angular/material/dialog";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { InfoClientComponent } from "../info-client/info-client.component";
import { LocalService } from "src/app/core/services/local.service";
import { SignatureClientComponent } from "../signature-client/signature-client.component";
import { environment } from "src/environments/environment";
import { PapService } from "../pap.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import {
  ButtonAction,
  TableauComponent,
} from "src/app/shared/tableau/tableau.component";
import { DatatableComponent } from "src/app/shared/datatable/datatable.component";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";
import { AddPlainteComponent } from "../../plainte/add-plainte/add-plainte.component";
import { CompensationDetailComponent } from "../../entente-compensation/compensation-detail/compensation-detail.component";
import { PlainteDetailComponent } from "../../plainte/palainte-detail/plainte-detail.component";

@Component({
  selector: "app-pap-detail",
  templateUrl: "./pap-detail.component.html",
  standalone: true,
  imports: [
    AngularMaterialModule,
    InfoClientComponent,
    TableauComponent,
    DatatableComponent,
    CommonModule,
  ],
  styleUrl: "./pap-detail.component.css",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PapDetailComponent implements OnInit {
  @ViewChild("drawer") drawer: MatDrawer;
  panels: any[] = [];
  selectedPanel: string = "info-client";
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constantes = CONSTANTES;
  loader: boolean = false;
  drawerMode: "side" | "over";
  drawerOpened: boolean;
  menuData: any;
  privileges: any;
  data: any;
  paramsId: any;
  infosPap: any;
  isLoading = false;
  typeClient: boolean;
  noImage = "assets/images/noImage.png";
  imagePath = "";
  noImageStore = "";
  typePM;
  dialogRef: any;
  loaderImg: boolean = false;
  attributComplementaires: any = [];
  urlImage = environment.apiUrl + "image/getFile/";

  pageSizeOptions = [5, 10, 25, 100, 500, 1000];
  pageSize: number = 10;
  pageIndex: number = 0;
  headers: any = [];
  btnActions: any = [];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  informations: any;
  displayedColumns: any;
  searchList: any;
  hasDelete: boolean;
  length = 100;
  dataSource: MatTableDataSource<any>;
  datas = [];
  loadData: boolean = false;
  offset: number = 0;
  plaintes: any = [];
  currentUser: any;

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private clientServive: ClientVueService,
    private _matDialog: MatDialog,
    private papservice: PapService,
    private localService: LocalService,
    private papService: PapService,
    public toastr: ToastrService
  ) {
    this.currentUser = this.localService.getDataJson("user");
    this.menuData = [
      {
        title: "Actions liées",
        children: [
          {
            id: "info-client",
            title: "Personne affecté",
            icon: "heroicons_outline:user-group",
          },
          {
            id: "plainte",
            title: "Plaintes",
            icon: "heroicons_outline:user-group",
          },
          {
            id: "entente",
            title: "Ententes de compensation",
            icon: "heroicons_outline:users",
          },
        ],
      },
    ];

    this.route.params.subscribe((params) => {
      this.paramsId = params["id"];
    });
    // const panel = this.coreService.decriptDataToLocalStorage("CD-@--120");
    // this.selectedPanel = panel;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Setup available panels
    this.panels = [
      {
        id: "compte",
        icon: "heroicons_outline:user-circle",
        title: "Compte",
        description: "",
      },
      {
        id: "bureau",
        icon: "heroicons_outline:lock-closed",
        title: "Bureaux",
        description: "",
      },
      {
        id: "role",
        icon: "heroicons_outline:credit-card",
        title: "Rôle",
        description: "",
      },
      {
        id: "caisse",
        icon: "heroicons_outline:bell",
        title: "Caisse",
        description: "",
      },
      {
        id: "plafond",
        icon: "heroicons_outline:user-group",
        title: "Plafond",
        description: "",
      },
    ];
    this.getpap();
  }

  getAttributComplementaireClient(infosPap) {
    this.isLoading = true;
    const data = {
      natureAttribut: "CLIENT",
      referenceObjet: infosPap,
    };
    this.coreService
      .getAttributComplementaire(data, "attribut-complementaire/mine")
      .subscribe(
        (resp) => {
          if (
            resp[this.constantes.RESPONSE_CODE] ===
            this.constantes.HTTP_STATUS.SUCCESSFUL
          ) {
            this.isLoading = false;
            this.attributComplementaires = resp[this.constantes.RESPONSE_DATA];
            this._changeDetectorRef.markForCheck();
          } else {
            this.isLoading = false;
          }
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Navigate to the panel
   *
   * @param panel
   */
  goToPanel(panel: string): void {
    this.selectedPanel = panel;
    if (this.selectedPanel == "plainte") {
      this.headers = this.createHeaderPlainte();
      this.btnActions = this.createActionsPlainte();
      this.getPlainteByCodePap();
    } else if (this.selectedPanel == "entente") {
      this.headers = this.createHeaderEntente();
      this.btnActions = this.createActionsEntente();
      this.getEntenteByCodePap();
    }

    // Close the drawer on 'over' mode
    if (this.drawerMode === "over") {
      this.drawer.close();
    }
  }

  /**
   * Get the details of the panel
   *
   * @param id
   */

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  getFirstElementWord(value) {
    if (value) {
      return value
        .match(/(?<=(\s|^))[a-z]/gi)
        .join("")
        .toUpperCase();
    }
  }

  changeClient(type, id): void {
    console.log(id);
    this.snackbar
      .showConfirmation("Voulez-vous vraiment marque ce pap comme dédommagé ?")
      .then((result) => {
        if (result["value"] == true) {
          this.isLoading = true;
          this.loader = true;
          //   let url;
          // let message;
          this.clientServive
            .updateEntity("personneAffectes/dedommagerPap", id, type)
            .subscribe(
              (response) => {
                this.isLoading = false;
                this.loader = false;
                this.snackbar.openSnackBar(response["message"], "OK", [
                  "mycssSnackbarGreen",
                ]);
                // this.getpap();
              },
              (error) => {
                this.isLoading = false;
                this.loader = false;
                this.snackbar.showErrors(error);
              }
            );
        }
      });
  }

  selectOnFile(evt, type, name) {
    let accept = [];
    let extension = "";
    if (type === "photo_profile") {
      accept = [".png", ".PNG", ".jpg", ".JPG"];
      extension = "une image";
    }
    for (const file of evt.target.files) {
      const index = file.name.lastIndexOf(".");
      const strsubstring = file.name.substring(index, file.name.length);
      const ext = strsubstring;
      // Verification de l'extension du ficihier est valide
      if (accept.indexOf(strsubstring) === -1) {
        this.snackbar.openSnackBar(
          "Ce fichier " + file.name + " n'est " + extension,
          "OK",
          ["mycssSnackbarRed"]
        );
        return;
      } else {
        // recuperation du fichier et conversion en base64
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (type === "photo_profile") {
            const img = new Image();
            img.src = e.target.result;

            img.onload = () => {
              const docBase64Path = e.target.result;

              if (
                ext === ".png" ||
                ext === ".PNG" ||
                ext === ".jpg" ||
                ext === ".JPG" ||
                ext === ".jpeg" ||
                ext === ".JPEG"
              ) {
                this.saveStoreFile(file, type);
              }
            };
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  saveStoreFile(file, type) {
    console.log("hello");
    let formData = new FormData();
    formData.append("file", file);
    this._changeDetectorRef.detectChanges();
    const dataFile = { file: file };
    this.clientServive.saveStoreFile(formData).subscribe(
      (resp) => {
        if (resp) {
          console.log(resp);
          this.noImageStore = resp["fileName"];
          console.log(this.noImageStore);

          this.saveFile(this.noImageStore);
          this._changeDetectorRef.detectChanges();
          //   this.snackbar.openSnackBar('Fichier chargée avec succès', 'OK', ['mycssSnackbarGreen']);
        }
      },
      (error) => {
        this.snackbar.showErrors(error);
      }
    );
  }

  saveFile(file) {
    this.loaderImg = true;
    this._changeDetectorRef.detectChanges();
    this.clientServive
      .updateEntity("personneAffectes/addImage", this.infosPap.id, file)
      .subscribe(
        (resp) => {
          console.log(resp["data"][0]);
          this.imagePath = `${this.urlImage + resp["data"][0].imagePath}`;
          this.loaderImg = false;
          this._changeDetectorRef.detectChanges();
          this.snackbar.openSnackBar("Fichier chargée avec succès", "OK", [
            "mycssSnackbarGreen",
          ]);
          this.getpap();
        },
        (error) => {
          this.loaderImg = false;
          this.snackbar.showErrors(error);
        }
      );
  }

  signatureClient(): void {
    this.dialogRef = this._matDialog.open(SignatureClientComponent, {
      autoFocus: true,
      width: "35rem",
      panelClass: "event-form-dialog",
      disableClose: true,
      data: {
        action: "new",
        pap: this.infosPap,
      },
    });
    this.dialogRef.afterClosed().subscribe((resp) => {
      // this.getClient(this.paramsId);
    });
  }

  getpap() {
    this.infosPap = this.localService.getDataJson("pap");
    if (this.infosPap.imagePath != null) {
      this.imagePath = `${this.urlImage + this.infosPap.imagePath}`;
    }
  }

  getEntenteByCodePap() {
    this.datas = [];
    return this.papservice
      .getPlaintEntenteByCodePap("ententes", this.infosPap.codePap)
      .subscribe((data: any) => {
        this.loadData = false;
        if (data["responseCode"] == 200) {
          this.loadData = false;
          console.log(data["data"]);
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
      });
  }

  // getEntentes() {
  //   return this.papservice.all("ententes").subscribe((data: any) => {
  //     this.loadData = false;
  //     if (data["responseCode"] == 200) {
  //       this.loadData = false;
  //       console.log(data["data"]);
  //       this.dataSource = new MatTableDataSource(data["data"]);
  //       this.dataSource.paginator = this.paginator;
  //       this.dataSource.sort = this.sort;
  //       this.datas = data["data"];
  //       this.length = data["length"];
  //       console.log("length", this.length);
  //       this._changeDetectorRef.markForCheck();
  //     } else {
  //       this.loadData = false;
  //       this.dataSource = new MatTableDataSource();
  //     }
  //   });
  // }

  getPlainteByCodePap() {
    this.datas = [];
    return this.papservice
      .getByCodePap("plaintes", this.infosPap.codePap)
      .subscribe((data: any) => {
        this.loadData = false;
        if (data["responseCode"] == 200) {
          this.loadData = false;
          console.log(data["data"]);
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
      });
  }

  // getEntente() {
  //   this.datas = [];
  //   return this.parentService
  //     .listeByProject(
  //       "ententes",
  //       this.pageSize,
  //       this.offset,
  //       this.currentUser.projects[0]?.id
  //     )
  //     .subscribe(
  //       (data: any) => {
  //         console.log("ententes");
  //         console.log(data);
  //         this.loadData = false;
  //         if (data["responseCode"] == 200) {
  //           this.loadData = false;
  //           this.dataSource = new MatTableDataSource(data["data"]);
  //           this.dataSource.paginator = this.paginator;
  //           this.dataSource.sort = this.sort;
  //           this.datas = data["data"];
  //           this.length = data["length"];
  //           this._changeDetectorRef.markForCheck();
  //         } else {
  //           this.loadData = false;
  //           this.dataSource = new MatTableDataSource();
  //         }
  //       },
  //       (err) => {
  //         console.log(err);
  //       }
  //     );
  // }

  createHeaderPlainte() {
    return [
      {
        th: "Numéro du dossier",
        td: "numeroDossier",
      },
      {
        th: "Code Pap",
        td: "codePap",
      },
      {
        th: "Date d'enregistrement",
        td: "dateEnregistrement",
      },
      {
        th: "Objet",
        td: "recommandation",
      },
    ];
  }

  createHeaderEntente() {
    return [
      {
        th: "Code Pap",
        td: "codePap",
      },
      {
        th: "Prenom",
        td: "prenom",
      },
      {
        th: "Nom",
        td: "nom",
      },
    ];
  }

  createActionsPlainte(): ButtonAction[] {
    return [
      {
        icon: "bxs-info-circle",
        couleur: "#D55E00	",
        size: "icon-size-4",
        title: "détail",
        isDisabled: this.hasDelete,
        action: (element?) => this.detailItemsPlainte(element),
      },
    ];
  }



  detailItemsPlainte(element: any) {
    console.log(element);
    this.snackbar.openModal(
      PlainteDetailComponent,
      "auto",
      "edit",
      "",
      element,
      "",
      () => {
        this.getPlainteByCodePap();
      }
    );
  }

  createActionsEntente(): ButtonAction[] {
    return [
      {
        icon: "bxs-info-circle",
        couleur: "#D55E00	",
        size: "icon-size-4",
        title: "détail",
        isDisabled: this.hasDelete,
        action: (element?) => this.detailItemsEntente(element),
      },
    ];
  }

  detailItemsEntente(element: any) {
    console.log(element);
    this.snackbar.openModal(
      CompensationDetailComponent,
      "",
      "edit",
      "",
      element,
      "",
      () => {
        this.getEntenteByCodePap();
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
    this.getPlainteByCodePap();
  }

  triggerFileUpload() {
    const fileUploadElement = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileUploadElement) {
      fileUploadElement.click();
    }
  }
  headings = [];
  dataExcel = [];
  fileUpload(event: any) {
    console.log(event.target.files);
    const selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFile);
    fileReader.onload = (event: any) => {
      console.log(event);
      let binaryData = event.target.result;
      let workbook = XLSX.read(binaryData, { type: "binary" });
      workbook.SheetNames.forEach((sheet) => {
        const worksheet = workbook.Sheets[sheet];
        const data: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];
        const headers = data[0];
        this.headings = headers;
        const jsonData = data.slice(1).map((row: any[]) => {
          let obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index];
          });
          return obj;
        });
        this.dataExcel = jsonData;
        console.log(this.dataExcel);

        //this.convertedJson = JSON.stringify(jsonData, undefined, 4);
      });
    };
  }
  convertedJson: string;

  resetDataFromExcel() {
    this.headings = [];
    this.dataExcel = [];
    this.convertedJson = "";
  }
  invalidComplaints: any[] = [];
  importData() {
    // Ajouter la clé 'codePap' à chaque objet dans 'this.dataExcel'
    this.dataExcel = this.dataExcel.map((item: any) => {
      return { ...item, codePap: this.infosPap.codePap };
    });

    // Ensuite, envoyer la requête
    this.papService.add("plaintes/importer", this.dataExcel).subscribe(
      (response: any) => {
        console.log(response);
        if (response.responseCode === 201) {
          this.toastr.success(response.message);
          this.dataExcel = [];
        } else if (response.responseCode === 207) {
          //   this.toastr.warning(response.message);
          // this.dataExcel = [];
          //this.invalidComplaints = response.data[0].plaintesInvalides.map(
          //(item: any) => item.plainteRequest
          // );
          //  console.log("Invalid complaints:", this.invalidComplaints);
          //this.dataExcel = this.invalidComplaints;
        } else if (response.responseCode === 400) {
          this.toastr.error(response.message);
          this.dataExcel = [];
          console.log("All invalid complaints:", this.invalidComplaints);
        }
      },
      (error) => {
        console.error(error);
        this.toastr.error("An error occurred during the import process.");
      }
    );
    this.dataExcel = [];
  }

  addItems(): void {
    this.snackbar.openModal(
      AddPlainteComponent,
      "55rem",
      "new",
      "",
      this.datas,
      "",
      () => {
        //this.getPlainte();
      }
    );
  }
}
