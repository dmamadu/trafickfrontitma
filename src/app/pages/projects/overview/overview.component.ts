import { resolveUserImageUrl } from "src/app/shared/utils/user-image";
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

  // ---------- Affichage (refonte charte INVODIS) ----------

  logoEnErreur = false;

  /** Couleur principale propre au projet (touche projet), sinon la charte INVODIS. */
  get couleurProjet(): string {
    try {
      const primary = this.DetailProject?.colors ? JSON.parse(this.DetailProject.colors)?.primary : null;
      return typeof primary === "string" && /^#[0-9a-f]{3,8}$/i.test(primary) ? primary : "#245363";
    } catch {
      return "#245363";
    }
  }

  get bandeau(): string {
    return `linear-gradient(120deg, ${this.couleurProjet} 0%, #1b404c 100%)`;
  }

  get logoUrl(): string | null {
    const url = this.DetailProject?.imageUrl;
    return url ? resolveUserImageUrl(url) : null;
  }

  /** Durée totale du projet, ex. « 12 mois ». */
  get dureeLibelle(): string {
    const debut = this.dateValide(this.DetailProject?.datedebut);
    const fin = this.dateValide(this.DetailProject?.datefin);
    if (!debut || !fin || fin <= debut) {
      return "";
    }
    const mois = Math.round((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    return mois >= 1 ? `${mois} mois` : "moins d'un mois";
  }

  /** Part du calendrier écoulée (0–100), ou null si les dates manquent. */
  get avancement(): number | null {
    const debut = this.dateValide(this.DetailProject?.datedebut);
    const fin = this.dateValide(this.DetailProject?.datefin);
    if (!debut || !fin || fin <= debut) {
      return null;
    }
    const ratio = (Date.now() - debut.getTime()) / (fin.getTime() - debut.getTime());
    return Math.round(Math.min(Math.max(ratio, 0), 1) * 100);
  }

  badgeStatut(status: string): string {
    const s = (status ?? "").toLowerCase();
    if (["actif", "en cours", "inprogress"].includes(s)) return "inv-badge--success";
    if (["complété", "completed", "terminé", "clôturé"].includes(s)) return "inv-badge--primary";
    if (["en attente", "pending", "suspendu"].includes(s)) return "inv-badge--warning";
    return "";
  }

  photoMembre(membre: any): string | null {
    if (membre?.imageUrl && !/example\.com/.test(membre.imageUrl)) {
      return resolveUserImageUrl(membre.imageUrl);
    }
    if (membre?.image?.image) {
      return this.getImageFromBase64(membre.image.type, membre.image.image);
    }
    return null;
  }

  private dateValide(valeur: any): Date | null {
    const d = valeur ? new Date(valeur) : null;
    return d && !isNaN(d.getTime()) ? d : null;
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
