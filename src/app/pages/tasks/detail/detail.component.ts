import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ModalModule } from 'ngx-bootstrap/modal';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DndModule } from "ngx-drag-drop";
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  standalone: true,
  imports: [CommonModule, BrowserModule,BrowserAnimationsModule,BrowserAnimationsModule,
      DndModule, ModalModule,MatIconModule],
  styleUrls: ["./detail.component.scss"],
})

/**
 * Tasks-list component
 */
export class DetailComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  modalRef?: BsModalRef;

  submitted = false;
  formData: UntypedFormGroup;

  myFiles: string[] = [];
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
  userConnecter;
  offset: number = 0;
  title: string = "Gestion des produits";
  url: string = "taches";
  panelOpenState = false;
  img;
  image;
  privilegeByRole: any;
  privilegeForPage: number = 2520;
  privilegePage;
  headers: any = [];
  btnActions: any = [];
  DetailProject: any;
  overviewBarChart: any;

  tache: any;
  constructor(
    private parentService: ServiceParent,
    public toastr: ToastrService,
    public matDialogRef: MatDialogRef<DetailComponent>,
    @Inject(MAT_DIALOG_DATA) _data
  ) {
    this.tache = _data.data;
    console.log(this.tache);
  }

  ngOnInit() {}

  onFileChange(event) {
    for (var i = 0; i < event.target.files.length; i++) {
      this.myFiles.push("assets/images/users/" + event.target.files[i].name);
    }
  }

  get form() {
    return this.formData.controls;
  }

  /**
   * Open modal
   * @param content modal content
   */

  taches: any[];
  getTaches() {
    return this.parentService
      .list(this.url, this.pageSize, this.offset)
      .subscribe(
        (data: any) => {
          this.loadData = false;
          if (data["responseCode"] == 200) {
            this.taches = data["data"];
            console.log(this.taches);
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
