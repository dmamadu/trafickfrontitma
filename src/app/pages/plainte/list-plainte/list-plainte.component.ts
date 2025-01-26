import { DatePipe } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import * as moment from "moment";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { LocalService } from "src/app/core/services/local.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import {
  ButtonAction,
  TableauComponent,
} from "src/app/shared/tableau/tableau.component";
import { PapAddComponent } from "../../pap/pap-add/pap-add.component";
import { PapService } from "../../pap/pap.service";
import { SharedService } from "../../projects/shared.service";
import { AddComponent } from "../../tasks/add/add.component";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { UIModule } from "src/app/shared/ui/ui.module";
import { AddPlainteComponent } from "../add-plainte/add-plainte.component";
import * as XLSX from "xlsx";
import { DatatableComponent } from "src/app/shared/datatable/datatable.component";
import { ExportService } from "src/app/shared/core/export.service";

@Component({
  selector: "app-list-plainte",
  templateUrl: "./list-plainte.component.html",
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
    ExportService
  ],
  imports: [
      TableauComponent,
      UIModule,
      AngularMaterialModule,
      DatatableComponent,
  ],
  styleUrl: "./list-plainte.component.css",
})
export class ListPlainteComponent implements OnInit {
  breadCrumbItems: (
    | { label: string; active?: undefined }
    | { label: string; active: boolean }
  )[];
  filterTable($event: any) {
    throw new Error("Method not implemented.");
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  informations: any;
  displayedColumns: any;
  searchList: any;
  codeEnvoye: number; //code envoye par notre menu
  hasUpdate: boolean;
  hasDelete: boolean;
  hasDetail: boolean;
  length = 100;
  searchForm: UntypedFormGroup;
  dialogRef: any;
  dataSource: MatTableDataSource<any>;
  datas = [];
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
  //url: string = "users/by_role?roleName=plainte";
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
    private parentService: ServiceParent,
    private _router: Router,
    private datePipe: DatePipe,
    private snackbar: SnackBarService,
    private _matDialog: MatDialog,
    private papService: PapService,
    public matDialogRef: MatDialogRef<PapAddComponent>,
    private _changeDetectorRef: ChangeDetectorRef,
    public toastr: ToastrService,
    private sharedService: SharedService,
    private localService: LocalService,
    private coreService: CoreService,
    private exportService: ExportService,

  ) {}

  ngOnInit(): void {
    //  this.getPlainte();

    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.getPlainte();

    // if (this.privilegePage) {
    //   this.getList();
    // //  this.checkCodePrivilegeForRole();

    // }
    this.breadCrumbItems = [
      { label: "Plainte" },
      { label: "List des plaintes", active: true },
    ];
  }

  createHeader() {
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
        action: (element?) => this.detailItems(element.id, element),
      },
    ];
  }

  getPlainte() {
    this.loadData=true;
    return this.parentService
      .list("plaintes", this.pageSize, this.offset)
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
          this.loadData = false;
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
    this.getPlainte();
  }

  updateItems(information): void {
    console.log(information);
    this.snackbar.openModal(
      AddPlainteComponent,
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

  //cette fonction permet de supprimer
  supprimerItems(id, information) {
    this.snackbar
      .showConfirmation("Voulez-vous vraiment supprimer cette plainte?")
      .then((result) => {
        if (result["value"] == true) {
          this.currentIndex = information;
          this.showLoader = "isShow";
          this.coreService.deleteItem(id, "plaintes").subscribe(
            (resp: any) => {
              if (resp && resp["responseCode"] == '200') {
                this.getPlainte();
                this.snackbar.openSnackBar(
                  "Plainte supprimée avec succès",
                  "OK",
                  ["mycssSnackbarGreen"]
                );
              } else {
                console.error('Unexpected response structure', resp);
                this.snackbar.openSnackBar(
                  "Une erreur s'est produite lors de la suppression de la plainte.",
                  "OK",
                  ["mycssSnackbarRed"]
                );
              }
            },
            (error) => {
              this.snackbar.showErrors(error);
            }
          );
        }
      });
  }


  filterList() {
    this.isCollapsed = !this.isCollapsed;
  }

  detailItems(id, information) {
    console.log("ttetete", information);
    this.localService.saveDataJson("plainte", information);
    this.sharedService.setSelectedItem(information);
    this._router.navigate(["plainte/detail"]);
  }

  record(item) {}

  addItems(): void {
    this.snackbar.openModal(
      AddPlainteComponent,
      "55rem",
      "new",
      "",
      this.datas,
      "",
      () => {
        this.getPlainte();
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


  invalidComplaints: any[] = [];
  importData() {
    this.papService.add("plaintes/importer", this.dataExcel).subscribe(
      (response: any) => {
        console.log(response);
        if (response.responseCode === 201) {
          this.toastr.success(response.message);
          this.dataExcel = [];
        } else if (response.responseCode === 207) {
          this.toastr.warning(response.message);
          this.dataExcel = [];
          this.invalidComplaints = response.data[0].plaintesInvalides.map(
            (item: any) => item.plainteRequest
          );
          //this.invalidComplaints = response.data[0].plaintesInvalides;
          console.log("Invalid complaints:", this.invalidComplaints);
          this.dataExcel = this.invalidComplaints;
        } else if (response.responseCode === 400) {
          this.toastr.error(response.message);
          this.dataExcel = [];
          // this.invalidComplaints = response.data[0].plaintesInvalides;
          this.invalidComplaints = response.data[0].plaintesInvalides.map(
            (item: any) => item.plainteRequest
          );
          console.log("All invalid complaints:", this.invalidComplaints);
          this.dataExcel = this.invalidComplaints;
        }
        //  this.dataExcel = [];

        this.getPlainte();
      },
      (error) => {
        console.error(error);
        this.toastr.error("An error occurred during the import process.");
      }
    );
  }

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
        //this.convertedJson = JSON.stringify(jsonData, undefined, 4);
        console.log(this.dataExcel);
      });
    };
  }




  exportAs(format) {
    let nom = 'invalid data';
    let value = this.invalidComplaints; // Utilisation de invalidComplaints au lieu de l'appel backend

    if (value.length != 0) {
      if (format == "excel") {
        var col = this.headings;
        var rows = [];
        var itemCurrent;

        for (var item of value) {
          itemCurrent = item;
          let tabField = [];
          let elementKeys = Object.keys(item);
          let i = 0;

          for (let field of this.headings) {
            for (let element of elementKeys) {
              if (element.toString() == field.toString()) {
                if (
                  field == "createdAt" ||
                  field == "dateNaiss" ||
                  field == "dateCirculation" ||
                  field == "dateDepart" ||
                  field == "dateDarriver"
                ) {
                  tabField.push({
                    [this.headings[i]]:
                      moment(itemCurrent[field]).format("DD/MM/YYYY") || "",
                  });
                } else {
                  if (
                    typeof itemCurrent[field] === "object" &&
                    itemCurrent[field] !== null
                  ) {
                    let fieldValue =
                      itemCurrent[field]["libelle"] ||
                      itemCurrent[field]["nom"] ||
                      itemCurrent[field]["libellePays"] ||
                      "";
                    let fieldName = this.headings[i];

                    tabField.push({
                      [fieldName]: fieldValue,
                    });
                  } else {
                    tabField.push({
                      [this.headings[i]]:
                        itemCurrent[field] || "",
                    });
                  }
                }
              }
            }
            i++;
          }
          rows.push(Object.assign({}, ...tabField));
        }

        this.exportService.exportAsExcelFile(
          this.exportService.preFormatLoanInfo(rows),
          nom
        );
        this.snackbar.openSnackBar("Téléchargement réussi", "OK", [
          "mycssSnackbarGreen",
        ]);
        this.exporter = false;
      }
    } else {
      this.snackbar.openSnackBar("La liste est vide!!!", "OK", [
        "mycssSnackbarRed",
      ]);
    }
  }






}
