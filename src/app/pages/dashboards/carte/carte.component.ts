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


   @ViewChild('mapContainer') mapContainer!: ElementRef;
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
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-17.406666, 14.738872], // Dakar par défaut
      zoom: 12
    });

    this.map.addControl(new maplibregl.NavigationControl());
  }

    currentProjectId: any;
  private loadPaps(): void {
    this.loadData = true;
    const currentProjectId = this.localService.getData("ProjectId");

    this.parentService.list("databasePapPlaceAffaire", 1000, 0, this.currentProjectId)
      .subscribe({
        next: (data: any) => {
          if (data.responseCode === 200) {
            this.paps = data.data.map((pap: any) => ({
              ...pap,
              position: this.parsePoint(pap.pointGeometriques),
              informations: this.generatePapInfoWindow(pap)
            }));

            this.addMarkers();
            this.centerOnPaps();
          }
          this.loadData = false;
          this._changeDetectorRef.markForCheck();
        },
        error: (err) => {
          console.error(err);
          this.loadData = false;
        }
      });
  }

  private parsePoint(pointStr: string): [number, number] {
    const coords = pointStr.replace(/[Point()]/g, "").trim().split(" ");
    return [parseFloat(coords[0]), parseFloat(coords[1])];
  }

  private generatePapInfoWindow(pap: any): string {
    return `
      <div class="map-popup">
        <h4>${pap.nom} ${pap.prenom}</h4>
        <p><strong>Code:</strong> ${pap.codePap}</p>
        <p><strong>Commune:</strong> ${pap.commune}</p>
        <p><strong>Activité:</strong> ${pap.activitePrincipale}</p>
      </div>
    `;
  }

  private addMarkers(): void {
    this.paps.forEach(pap => {
      const marker = new maplibregl.Marker({ color: '#FF0000' })
        .setLngLat(pap.position)
        .setPopup(new maplibregl.Popup().setHTML(pap.informations))
        .addTo(this.map);

      marker.getElement().addEventListener('click', () => {
        this.selectedPap = pap;
        this._changeDetectorRef.detectChanges();
      });
    });
  }

  private centerOnPaps(): void {
    if (this.paps.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    this.paps.forEach(pap => bounds.extend(pap.position));

    this.map.fitBounds(bounds, {
      padding: 100,
      maxZoom: 14
    });
  }

  closePopup(): void {
    this.selectedPap = null;
  }
}
