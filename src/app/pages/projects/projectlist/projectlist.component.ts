import { Component, OnInit, ViewChild } from "@angular/core";

import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { Store } from "@ngrx/store";
import { ProjectService } from "src/app/core/services/project.service";
import { ResponseData } from "src/app/shared/models/Projet.model";
import { Project } from "../project.model";
import { SharedService } from "../shared.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ModalDirective } from "ngx-bootstrap/modal";
import { ButtonAction } from "src/app/shared/tableau/tableau.component";
import { SnackBarService } from "src/app/shared/core/snackBar.service";

@Component({
  selector: "app-projectlist",
  templateUrl: "./projectlist.component.html",
  styleUrls: ["./projectlist.component.scss"],
})

/**
 * Projects-list component
 */
export class ProjectlistComponent implements OnInit {
  totalItems = 12;
  // bread crumb items
  breadCrumbItems: Array<{}>;
  total$: any;
  page: any = 1;
  endItem: any = 12;
  returnedArray: any;
  projectlist: any = [];
  hasDelete: boolean;
  hasUpdate: boolean;
  hasDetail: boolean;
  isLoading: boolean = false;
  pageSizeOptions = [5, 10, 25, 100, 500, 1000];
  pageSize: number = 10;
  pageIndex: number = 0;
  headers: any = [];
  btnActions: any = [];
  length = 100;
  removeItemModal?: ModalDirective;
  @ViewChild("removeItemModal", { static: false })
  deleteId: any;
  constructor(
    public store: Store,
    private projectService: ProjectService,
    private sharedService: SharedService,
    private snackbar: SnackBarService,
    private router: Router,
    public toastr: ToastrService
  ) {}

  ngOnInit() {
    this.headers = this.createHeader();
    this.btnActions = this.createActions();
    this.loadProject();
    this.breadCrumbItems = [
      { label: "Projects" },
      { label: "Projects List", active: true },
    ];
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    this.endItem = event.page * event.itemsPerPage;
    this.projectlist = this.returnedArray.slice(startItem, this.endItem);
  }

  filteredProjects: Project[] = [];
  loadProject() {
    this.isLoading = true;
    return this.projectService
      .all<ResponseData<Project[]>>("projects/all")
      .subscribe((data: ResponseData<Project[]>) => {
        this.projectlist = data.data;
        this.filteredProjects = this.projectlist;
        this.isLoading = false;
      });
  }

  myImage: string;




  selectItem(item: any) {
    this.sharedService.setSelectedItem(item);
    this.router.navigate(["/projects/update"]);
  }



  delet(userId: number) {
    this.snackbar
      .showConfirmation("Voulez-vous vraiment supprimer ce parti affecté ?")
      .then((result) => {
        if (result["value"] == true) {
          const message = "Project  supprimé";
          this.projectService
            .delete<ResponseData<Project>>(userId, "projects/delete")
            .subscribe((resp) => {
              this.snackbar.openSnackBar(message + " avec succès", "OK", [
                "mycssSnackbarGreen",
                (this.filteredProjects = this.filteredProjects.filter(
                  (mo) => mo.id !== userId
                )),
              ]),
                (error) => {
                  this.snackbar.showErrors(error);
                };
            });
        }
      });
  }

  removeProjet(id: any) {
    this.removeItemModal?.show();
  }



  filterTable(event: any) {
    const searchValue = event.target.value.toLowerCase();
    if (searchValue) {
      this.filteredProjects = this.projectlist.filter(
        (project) =>
          project.libelle.toLowerCase().includes(searchValue) ||
          project.categorie.toLowerCase().includes(searchValue) ||
          project.status.toLowerCase().includes(searchValue) ||
          project.datedebut.toLowerCase().includes(searchValue)
      );
    } else {
      this.filteredProjects = this.projectlist;
    }
  }

  createHeader() {
    return [
      {
        th: "Libelle",
        td: "libelle",
      },
      {
        th: "Date début",
        td: "datedebut",
      }
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
        action: (element?) => this.selectItem(element),
      },
      {
        icon: "bxs-trash-alt",
        couleur: "red",
        size: "icon-size-4",
        title: "Supprimer",
        isDisabled: this.hasDelete,
        action: (element?) => this.delet(element.id),
      },
      {
        icon: "bxs-info-circle",
        couleur: "#00bfff	",
        size: "icon-size-4",
        title: "détail",
        isDisabled: this.hasDelete,
        action: (element?) => this.redirectToOverview(element.id),
      },
    ];
  }

  redirectToOverview(id: number): void {
    this.router.navigate(["/overview", id]);
  }
}
