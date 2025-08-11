import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ColorService } from "src/app/core/services/color.service";
import { LocalService } from "src/app/core/services/local.service";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";

@Component({
  selector: "app-select-project",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AngularMaterialModule,
    MatProgressSpinnerModule
  ],
  templateUrl: "./select-project.component.html",
  styleUrl: "./select-project.component.css",
})
export class SelectProjectComponent implements OnInit {
  closeModal() {
    this._matDialog.closeAll();
  }
  projects: any[] = null;
  selectedProjectId: number | null = null;

  appName: string = "InVodis";

  constructor(
    private localService: LocalService,
    private router: Router,
    private toastr: ToastrService,
    private _matDialog: MatDialog,
    private colorService: ColorService
  ) {}

  ngOnInit(): void {
    const user = this.localService.getDataJson("user");
    this.projects = user.projects || [];
     console.log('user',this.projects);
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
      const projectLogo = selectedProject.imageUrl || "default-logo.png";
      this.localService.saveData("ProjectLogo", projectLogo.toString());
      console.log('logo',projectLogo);
      
      this.router.navigate(["/dashboards/jobs"]);
      this.toastr.success("Projet sélectionné avec succès");
      this.closeModal();
    }
  }
}
