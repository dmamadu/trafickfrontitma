import { Component, OnInit } from "@angular/core";

import { overviewBarChart } from "./data";

import { ChartType } from "./overview.model";
import { ResponseData } from "src/app/shared/models/Projet.model";
import { Project } from "../project.model";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { MoService } from "src/app/core/services/mo.service";

@Component({
  selector: "app-overview",
  templateUrl: "./overview.component.html",
  styleUrls: ["./overview.component.scss"],
})

/**
 * Overview component
 */
export class OverviewComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  overviewBarChart: ChartType;
  projectId: number;
  DetailProject: Project = {
    users: [],
  };
  myImage: any;
  user: any;

  constructor(private route: ActivatedRoute, private moservice: MoService) {}

  ngOnInit() {
    this.overviewBarChart = overviewBarChart;

    this.projectId = +this.route.snapshot.paramMap.get("id");

    this.moservice.getById(this.projectId, "projects").subscribe(
      (data: ResponseData<Project>) => {
        this.DetailProject = data.data;
        console.log("====================================");
        console.log(this.DetailProject);
        console.log("====================================");
      },
      (err) => {
        console.log("====================================");
        console.log(err);
        console.log("====================================");
      }
    );
    // this.myImage = this.getImageFromBase64(
    //   this.user.user.image.type,
    //   this.user.user.image.image
    // );

    // fetches the data
    //this._fetchData();
  }

  getImageFromBase64(imageType: string, imageName: number[]): string {
    const base64Representation = "data:" + imageType + ";base64," + imageName;
    return base64Representation;
  }

  downloadBase64File(base64Data, fileName) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/octet-stream" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  }



  getFileName(url: string): string {
    return url.substring(url.lastIndexOf('/') + 1);
  }


  getStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'complété':
        return 'completed';
      case 'inprogress':
      case 'en cours':
        return 'en-cours';
      case 'en attente':
      case 'pending':
        return 'en-attente';
      default:
        return '';
    }
  }

}
