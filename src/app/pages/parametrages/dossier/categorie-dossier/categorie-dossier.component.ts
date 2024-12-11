import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ServiceParent } from 'src/app/core/services/serviceParent';
import { AngularMaterialModule } from 'src/app/shared/angular-materiel-module/angular-materiel-module';
import { CoreService } from 'src/app/shared/core/core.service';
import { SnackBarService } from 'src/app/shared/core/snackBar.service';
import { TableauComponent, ButtonAction } from 'src/app/shared/tableau/tableau.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { AddCategorieComponent } from '../../categorie-utilisateur/add-categorie/add-categorie.component';
import { AddCategorieDossierComponent } from './add-categorie-dossier/add-categorie-dossier.component';

@Component({
  selector: 'app-categorie-dossier',
  standalone: true,
  imports: [TableauComponent,
    UIModule,
    AngularMaterialModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './categorie-dossier.component.html',
  styleUrl: './categorie-dossier.component.css'
})
export class CategorieDossierComponent {

 url:string = 'categorieDocuments'

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

  offset: number = 0;
  title: string = "Gestion des catégories";

  headers: any = [];
  btnActions: any = [];


  breadCrumbItems: (
    | { label: string; active?: undefined }
    | { label: string; active: boolean }
  )[];


  roles: any[]=[];
  ngOnInit(): void {
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.getcatégories();
  }




  filterTable($event: any) {
    throw new Error("Method not implemented.");
  }



  createHeader() {
    return [
      {
        th: "Id",
        td: "id",
      },
      {
        th: "Libelle",
        td: "libelle",
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

    ];
  }


  constructor( private changeDetectorRefs: ChangeDetectorRef,
    private parentService: ServiceParent,
    private _router: Router,
    private datePipe: DatePipe,
    private snackbar: SnackBarService,
    private _matDialog: MatDialog,
    private coreService: CoreService,
  //  public matDialogRef: MatDialogRef<>,
    private _changeDetectorRef: ChangeDetectorRef,
    public toastr: ToastrService,
    ){

  }



  getcatégories() {
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
            console.log(data);
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










  updateItems(information): void {
    console.log(information);
    this.snackbar.openModal(
      AddCategorieComponent,
      "50rem",
      "edit",
      "",
      information,
      "",
      () => {
        this.getcatégories();
      }
    );
  }

  //cette catégorie permet de supprimer
  supprimerItems(id, information) {
    console.log("====================================");
    console.log(id);
    console.log("====================================");
    this.snackbar
      .showConfirmation("Voulez-vous vraiment supprimer cette catégorie?")
      .then((result) => {
        if (result["value"] == true) {
          this.deleteUser = true;
          this.currentIndex = information;
          this.showLoader = "isShow";
          const message = "catégorie  supprimée";
          this.coreService.deleteItem(id, "categorieDocuments").subscribe(
            (resp) => {
              this.showLoader = "isNotShow";
              if (resp["responseCode"]==200) {
              this.getcatégories();
              }
              this.snackbar.openSnackBar(
                "catégorie  supprimée avec succés",
                "OK",
                ["mycssSnackbarGreen"]
              );
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
  addItems(): void {
    this.snackbar.openModal(
      AddCategorieDossierComponent,
      "55rem",
      "new",
      "",
      this.datas,
      "",
      () => {
        this.getcatégories();
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
    this.getcatégories();
  }


}
