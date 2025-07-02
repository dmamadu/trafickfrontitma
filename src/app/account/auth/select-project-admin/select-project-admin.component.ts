import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ColorService } from "src/app/core/services/color.service";
import { LocalService } from "src/app/core/services/local.service";
import { ProjectService } from "src/app/core/services/project.service";
import { ResponseData } from "src/app/pages/projects/project.model";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { Project } from "src/app/store/ProjectsData/project.model";

@Component({
  selector: 'app-select-project-admin',
  standalone: true,
  imports: [ CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AngularMaterialModule,],
  templateUrl: './select-project-admin.component.html',
  styleUrl: './select-project-admin.component.css'
})
export class SelectProjectAdminComponent {


    closeModal() {
      this._matDialog.closeAll();
    }
    /*
    projects: any[] = [];
    selectedProjectId: number | null = null;

    appName: string = "GestionPro"; // Remplace par le nom de ton application


    constructor(
      private localService: LocalService,
      private router: Router,
      private toastr: ToastrService
    ) {}

    ngOnInit(): void {
      // Récupérer les projets de l'utilisateur depuis le localStorage
      const user = this.localService.getDataJson("user");
      this.projects = user.projects || [];
    }

    onProjectSelect(projectId: number) {
      // Enregistrer l'ID du projet sélectionné dans le localStorage
      this.localService.saveData("ProjectId", projectId.toString());
      // Rediriger vers le tableau de bord
      this.router.navigate(["/dashboards/jobs"]);
      // Afficher un message de succès
      this.toastr.success("Projet sélectionné avec succès");
    }
      */

    projects: any[] = [];
    selectedProjectId: number | null = null;
  isLoading: boolean = false;

    appName: string = "InVodis";

    constructor(
      private localService: LocalService,
      private router: Router,
      private toastr: ToastrService,
      private _matDialog: MatDialog,
      private colorService: ColorService,
          private projectService: ProjectService

    ) {}

    getProjects() {

    }

      loadProject() {
        this.isLoading = true;
        return this.projectService
          .all<ResponseData<Project[]>>("projects/all")
          .subscribe((data: ResponseData<Project[]>) => {
            this.projects = data.data;
            //this.filteredProjects = this.projectlist;
            this.isLoading = false;
          });
      }

    ngOnInit(): void {
      const user = this.localService.getDataJson("user");
      this.projects = user.projects || [];
      this.loadProject();
    }

    onProjectSelect(projectId: number) {
      const selectedProject = this.projects.find(
        (project) => project.id === projectId
      );
      if (selectedProject) {
        if (selectedProject.colors) {
          const colors = JSON.parse(selectedProject.colors);
          this.colorService.setColors(colors);
        }
        this.localService.saveData("ProjectId", projectId.toString());
        this.localService.saveData("libelleProject", selectedProject.libelle);
        this.router.navigate(["/dashboards/jobs"]);
        this.toastr.success("Projet sélectionné avec succès");
        this.closeModal();
      }
    }

}
