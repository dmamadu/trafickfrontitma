import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatPaginatorIntl, MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { AngularMaterialModule } from 'src/app/shared/angular-materiel-module/angular-materiel-module';
import { CoreService } from 'src/app/shared/core/core.service';
import { SnackBarService } from 'src/app/shared/core/snackBar.service';
import { ButtonAction, TableauComponent } from 'src/app/shared/tableau/tableau.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { PapAddComponent } from '../../pap/pap-add/pap-add.component';
import { PapService } from '../../pap/pap.service';
import { AddUserComponent } from './add-user/add-user.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-utilisateur',
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
  imports: [TableauComponent, UIModule, AngularMaterialModule],
  templateUrl: './utilisateur.component.html',
  styleUrl: './utilisateur.component.css'
})
export class UtilisateurComponent  implements OnInit {
filterTable($event: any) {
throw new Error('Method not implemented.');
}

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  informations: any;
  displayedColumns: any;
  hasUpdate: boolean;
  hasDelete: boolean;
  length = 100;
  dialogRef: any;
  dataSource: MatTableDataSource<any>;
  datas = [];
  deleteUser: boolean = false;
  loadData: boolean = false;
  isLoading: boolean = false;
  pageSizeOptions = [5, 10, 25, 100, 500, 1000];
  pageSize: number = 10;
  pageIndex: number = 0;
  //constantes = CONSTANTES;
  userConnecter;
  offset: number = 0;
  title: string = "Gestion des users";
  url: string = "users";
  panelOpenState = false;
  image;
  headers: any = [];
  btnActions: any = [];

  urlImage = environment.apiUrl + "fileAws/download/";

  breadCrumbItems: (
    | { label: string; active?: undefined }
    | { label: string; active: boolean }
  )[];

  constructor(

    private snackbar: SnackBarService,
    private papService: PapService,
    public matDialogRef: MatDialogRef<PapAddComponent>,
    private _changeDetectorRef: ChangeDetectorRef,
    public toastr: ToastrService,
    private coreService: CoreService
  ) {}
  ngOnInit(): void {
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.getUsers();

    this.breadCrumbItems = [
      { label: "Utilisateur" },
      { label: "Liste des utilisateurs", active: true },
    ];
  }


  getUsers() {
    this.loadData = true;
    return this.papService.all("users/all").subscribe(
      (data: any) => {
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

  addItems(): void {
    this.snackbar.openModal(
      AddUserComponent,
      "55rem",
      "new",
      "auto",
      this.datas,
      "",
      () => {
        this.getUsers();
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
    this.getUsers();
  }


  createHeader() {
    return [
      {
        th: "Nom",
        td: "lastname",
      },
      {
        th: "PRENOM",
        td: "firstname",
      },
      {
        th: "Email",
        td: "email",
      },
      {
        th: "Numéro téléphone ",
        td: "contact",
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
        couleur: "#D55E00",
        size: "icon-size-4",
        title: "Supprimer",
        isDisabled: this.hasDelete,
        action: (element?) => this.supprimerItems(element.id, element),
      },
      {
        icon: "bxs-info-circle",
        couleur: "black	",
        size: "icon-size-4",
        title: "détail",
        isDisabled: this.hasDelete,
        action: (element?) => this.detailItems(element.id, element),
      },
    ];
  }
  detailItems(id: any, element: any) {
    throw new Error('Method not implemented.');
  }
  updateItems(information): void {
    console.log(information);
    this.snackbar.openModal(
      AddUserComponent,
      "50rem",
      "edit",
      "",
      information,
      "",
      () => {
         this.getUsers();
      }
    );
  }

  //cette fonction permet de supprimer
  supprimerItems(id, information) {
    this.snackbar
      .showConfirmation("Voulez-vous vraiment supprimer ce utilisateur?")
      .then((result) => {
        if (result["value"] == true) {
          this.deleteUser = true;
          const message = "utilisateur  supprimé";
          this.coreService.deleteItem(id, "users").subscribe(
            (resp) => {
              if (resp["responseCode"] ==200) {
                this.getUsers();
              }
            },
            (error) => {
              this.deleteUser = false;
              this.snackbar.showErrors(error);
            }
          );
        }
      });
  }

}
