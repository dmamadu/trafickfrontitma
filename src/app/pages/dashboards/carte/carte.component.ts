import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { GoogleMapsModule } from "@angular/google-maps";

import { Map, Marker, Popup, LngLatLike } from "maplibre-gl";
//import "maplibre-gl/dist/maplibre-gl.css";
import * as maplibregl from "maplibre-gl";
import { LocalService } from "src/app/core/services/local.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
interface Pap {
  id: number;
  nom: string;
  adresse: string;
  position: LngLatLike;
  informations?: string;
}

@Component({
  selector: "app-carte",
  standalone: true,
  imports: [GoogleMapsModule],
  templateUrl: "./carte.component.html",
  styleUrl: "./carte.component.css",
})
export class CarteComponent implements OnInit {
  @ViewChild("mapContainer") mapContainer!: ElementRef;
  map!: maplibregl.Map;
  paps: Pap[] = [];
  selectedPap: any = null;
  loadData = false;

  constructor(
    private parentService: ServiceParent,
    private localService: LocalService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");

    console.log("====================================");
    console.log("Current Project ID:", this.currentProjectId);
    console.log("====================================");
  }
  ngOnInit(): void {
    throw new Error("Method not implemented.");
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadPaps();
  }

  private initMap(): void {
    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-17.406666, 14.738872], // Dakar par défaut
      zoom: 12,
    });

    this.map.addControl(new maplibregl.NavigationControl());
  }

  markers: maplibregl.Marker[] = [];

  currentProjectId: any;
  private loadPaps(): void {
    this.loadData = true;

    if (this.markers) {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }
    this.parentService
      .list("databasePapPlaceAffaire", 1000, 0, this.currentProjectId)
      .subscribe({
        next: (data: any) => {
          if (data.responseCode == 200) {
            this.paps = data.data.map((pap: any) => ({
              ...pap,
              position: this.parsePoint(pap.pointGeometriques),
              informations: this.generatePapInfoWindow(pap),
            }));
            console.log("====================================");
            console.log("Loaded Paps:", this.paps);
            console.log("====================================");
            this.addMarkers();
            this.centerOnPaps();
          }
          this.loadData = false;
          this._changeDetectorRef.markForCheck();
        },
        error: (err) => {
          console.error(err);
          this.loadData = false;
        },
      });
  }

  private parsePoint(pointStr: string): [number, number] {
    const coords = pointStr
      .replace(/[Point()]/g, "")
      .trim()
      .split(" ");
    return [parseFloat(coords[0]), parseFloat(coords[1])];
  }

  // private generatePapInfoWindow(pap: any): string {
  //   return `
  //     <div class="map-popup">
  //       <h4>${pap.nom} ${pap.prenom}</h4>
  //       <p><strong>Code:</strong> ${pap.codePap}</p>
  //       <p><strong>Commune:</strong> ${pap.commune}</p>
  //       <p><strong>Activité:</strong> ${pap.activitePrincipale}</p>
  //     </div>
  //   `;
  // }

  private generatePapInfoWindow(pap: any): string {
    // Traduction des statuts pour l'affichage
    const statutLabels = {
      recense: "Recensé (en attente d'instruction)",
      en_etude: "En étude",
      indemnisation_engagee: "Indemnisation engagée",
      indemnisation_terminee: "Indemnisation terminée",
      en_contentieux: "En contentieux",
    };

    return `
    <div class="map-popup">
      <h4>${pap.nom} ${pap.prenom}</h4>
      <p><strong>Code:</strong> ${pap.codePap}</p>
      <p><strong>Statut:</strong> ${
        statutLabels[pap.statutPap] || pap.statutPap
      }</p>
      <p><strong>Commune:</strong> ${pap.commune}</p>
      <p><strong>Activité:</strong> ${pap.activitePrincipale}</p>
    </div>
  `;
  }

  // private addMarkers(): void {
  //   this.paps.forEach((pap: any) => {
  //     let markerColor: string;

  //     switch (pap.statutPap) {
  //       case "indemnisation_terminee":
  //         markerColor = "#00FF00"; // Vert pour terminé
  //         break;
  //       case "recense":
  //         markerColor = "#FFA500"; // Orange pour recensé
  //         break;
  //       case "en_etude":
  //         markerColor = "#FFFF00"; // Jaune pour en étude
  //         break;
  //       case "indemnisation_engagee":
  //         markerColor = "#0000FF"; // Bleu pour indemnisation engagée
  //         break;
  //       case "en_contentieux":
  //         markerColor = "#FF00FF"; // Magenta pour contentieux
  //         break;
  //       default:
  //         markerColor = "#FF0000"; // Rouge par défaut
  //     }

  //     const marker = new maplibregl.Marker({ color: markerColor })
  //       .setLngLat(pap.position)
  //       .setPopup(new maplibregl.Popup().setHTML(pap.informations))
  //       .addTo(this.map);

  //     marker.getElement().addEventListener("click", () => {
  //       this.selectedPap = pap;
  //       this._changeDetectorRef.detectChanges();
  //     });
  //   });
  // }
  private addMarkers(): void {
  this.paps.forEach((pap:any) => {
    let markerColor = this.getColorByStatus(pap.statutPap);

    const marker = new maplibregl.Marker({ color: markerColor })
      .setLngLat(pap.position)
      .setPopup(new maplibregl.Popup().setHTML(pap.informations))
      .addTo(this.map);

    this.markers.push(marker); // Stocker le marqueur

    marker.getElement().addEventListener('click', () => {
      this.selectedPap = pap;
      this._changeDetectorRef.detectChanges();
    });
  });
}

private getColorByStatus(status: string): string {
  switch(status) {
    case 'indemnisation_terminee': return '#00FF00';
    case 'recense': return '#FFA500';
    case 'en_etude': return '#FFFF00';
    case 'indemnisation_engagee': return '#0000FF';
    case 'en_contentieux': return '#FF00FF';
    default: return '#FF0000';
  }
}
  private centerOnPaps(): void {
    if (this.paps.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    this.paps.forEach((pap) => bounds.extend(pap.position));

    this.map.fitBounds(bounds, {
      padding: 100,
      maxZoom: 14,
    });
  }

  closePopup(): void {
    this.selectedPap = null;
  }
}
