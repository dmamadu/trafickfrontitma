import { Component, OnInit, ViewChild } from "@angular/core";

import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { Store } from "@ngrx/store";
import { fetchprojectData } from "src/app/store/ProjectsData/project.actions";
import { selectData } from "src/app/store/ProjectsData/project-selector";
import { ProjectService } from "src/app/core/services/project.service";
import { ResponseData } from "src/app/shared/models/Projet.model";
import { Project } from "../project.model";
import { SharedService } from "../shared.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ModalDirective } from "ngx-bootstrap/modal";
import { ButtonAction } from "src/app/shared/tableau/tableau.component";

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
    return this.projectService
      .all<ResponseData<Project[]>>("projects/all")
      .subscribe((data: ResponseData<Project[]>) => {
        this.projectlist = data.data;
        console.log("====================================");
        console.log(this.projectlist);
        this.filteredProjects = this.projectlist;
        console.log("====================================");
      });
  }

  myImage: string;
  getImageFromBase64(imageType: string, imageName: number[]): string {
    const base64Representation = "data:" + imageType + ";base64," + imageName;
    return base64Representation;
  }

  editUser(id: any) {
    console.log(id);
  }

  selectItem(item: any) {
    this.sharedService.setSelectedItem(item);
    this.router.navigate(["/projects/update"]);
  }

  delet(userId: number) {
    this.projectService
      .delete<ResponseData<Project>>(userId, "projects/delete")
      .subscribe(
        (data: ResponseData<any>) => {
          console.log(data.message);
          this.toastr.success(data.message);
          this.filteredProjects = this.filteredProjects.filter((mo) => mo.id !== userId);
        },
        (err) => {
          console.log(err);
          this.toastr.error("Error deleting user");
        }
      );
  }

  removeProjet(id: any) {
    this.removeItemModal?.show();
  }

  // filterTable(event: any) {
  //   const searchValue = event.target.value.toLowerCase();
  //   this.projectlist = this.projectlist.filter(project =>
  //     project.libelle.toLowerCase().includes(searchValue) ||
  //     project.categorie.toLowerCase().includes(searchValue) ||
  //     project.status.toLowerCase().includes(searchValue) ||
  //     project.datedebut.toLowerCase().includes(searchValue)
  //   );
  // }

  filterTable(event: any) {
    const searchValue = event.target.value.toLowerCase();
    if (searchValue) {
      this.filteredProjects = this.projectlist.filter(project =>
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
          th: "Catégorie",
          td: "categorie",
        },
        {
          th: "Status",
          td: "statut",
        },
        {
          th: "Date début",
          td: "date_debut",
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
    this.router.navigate(['/overview', id]);
  }

}
