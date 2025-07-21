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
  selector: 'app-map',
  standalone: true,
  imports: [GoogleMapsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent  implements OnInit{

 @ViewChild("mapContainer") mapContainer!: ElementRef;
  map!: google.maps.Map;
  paps: any[] = [];
  selectedPap: any = null;
  loadData = false;
  markers: google.maps.marker.AdvancedMarkerElement[] = [];

  currentProjectId: any;
  infoWindow: google.maps.InfoWindow;

  constructor(
    private parentService: ServiceParent,
    private localService: LocalService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
    this.infoWindow = new google.maps.InfoWindow();
  }

  ngOnInit(): void {
    // Initialisation si nécessaire
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadPaps();
  }

  // private initMap(): void {
  //   const mapOptions = {
  //     center: new google.maps.LatLng(14.738872, -17.406666), // Dakar par défaut
  //     zoom: 12,
  //     mapTypeId: google.maps.MapTypeId.ROADMAP,
  //     disableDefaultUI: false,
  //     zoomControl: true,
  //     mapTypeControl: true,
  //     scaleControl: true
  //   };

  //   this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
  // }

  // private loadPaps(): void {
  //   this.loadData = true;

  //   // Supprimer les anciens marqueurs
  //   this.clearMarkers();

  //   this.parentService
  //     .list("databasePapPlaceAffaire", 1000, 0, this.currentProjectId)
  //     .subscribe({
  //       next: (data: any) => {
  //         if (data.responseCode == 200) {
  //           console.log('Loaded Paps:', data.data);
            
  //           this.paps = data.data.map((pap: any) => ({
  //             ...pap,
  //             position: this.parsePoint(pap.pointGeometriques),
  //             informations: this.generatePapInfoWindow(pap),
  //           }));
            
  //           this.addMarkers();
  //           this.centerOnPaps();
  //         }
  //         this.loadData = false;
  //         this._changeDetectorRef.markForCheck();
  //       },
  //       error: (err) => {
  //         console.error(err);
  //         this.loadData = false;
  //       },
  //     });
  // }

private initMap(): void {
  const mapOptions: google.maps.MapOptions = {
    center: { lat: 14.738872, lng: -17.406666 },
    zoom: 12,
    mapTypeControl: true,
    streetViewControl: false
  };

  this.map = new google.maps.Map(
    this.mapContainer.nativeElement,
    mapOptions
  );

  // Test marker
  new google.maps.Marker({
    position: { lat: 14.738872, lng: -17.406666 },
    map: this.map,
    title: "Test Marker"
  });
}

private loadPaps(): void {
  this.loadData = true;
  //this.clearMarkers();

  this.parentService.list("databasePapPlaceAffaire", 1000, 0, this.currentProjectId)
    .subscribe({
      next: (data: any) => {
        if (data.responseCode === 200) {
          this.paps = data.data
            .filter((pap: any) => pap.pointGeometriques) // Filtre les PAP sans coordonnées
            .map((pap: any) => ({
              ...pap,
              position: this.parsePoint(pap.pointGeometriques),
              informations: this.generatePapInfoWindow(pap),
            }));

          if (this.paps.length > 0) {
            this.addMarkers();
            this.centerOnPaps();
          } else {
            console.warn("Aucun PAP avec coordonnées valides");
          }
        }
        this.loadData = false;
      },
      error: (err) => {
        console.error(err);
        this.loadData = false;
      }
    });
}
  

  private parsePoint(pointStr: string): google.maps.LatLng {
    const coords = pointStr
      .replace(/[Point()]/g, "")
      .trim()
      .split(" ");
    return new google.maps.LatLng(parseFloat(coords[1]), parseFloat(coords[0]));
  }

  private generatePapInfoWindow(pap: any): string {
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
        <p><strong>Statut:</strong> ${statutLabels[pap.statutPap] || pap.statutPap}</p>
        <p><strong>Commune:</strong> ${pap.commune}</p>
        <p><strong>Activité:</strong> ${pap.activitePrincipale}</p>
      </div>
    `;
  }
  private addMarkers(): void {
  console.log("Ajout des marqueurs avec AdvancedMarkerElement", this.paps);
  
  this.paps.forEach((pap: any) => {
    if (!pap.position) {
      console.error("Position manquante pour PAP:", pap);
      return;
    }

    // Création du contenu HTML personnalisé pour le marqueur
    const content = document.createElement("div");
    content.innerHTML = `
      <div style="
        background-color: ${this.getColorByStatus(pap.statutPap)};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: pap.position,
      map: this.map,
      content: content,
      title: `${pap.nom} ${pap.prenom}`
    });

    marker.addListener('click', () => {
      this.selectedPap = pap;
      this._changeDetectorRef.detectChanges();
      
      // Afficher l'infobulle si nécessaire
      if (this.infoWindow) {
        this.infoWindow.setContent(pap.informations);
        this.infoWindow.open(this.map, marker);
      }
    });

    this.markers.push(marker);
  });
}


  // private addMarkers(): void {
  //   this.paps.forEach((pap: any) => {
  //     const markerColor = this.getColorByStatus(pap.statutPap);
      
  //     const marker = new google.maps.Marker({
  //       position: pap.position,
  //       map: this.map,
  //       icon: {
  //         path: google.maps.SymbolPath.CIRCLE,
  //         fillColor: markerColor,
  //         fillOpacity: 1,
  //         strokeWeight: 0,
  //         scale: 10
  //       },
  //       title: `${pap.nom} ${pap.prenom}`
  //     });

  //     google.maps.event.addListener(marker, 'click', () => {
  //       this.infoWindow.setContent(pap.informations);
  //       this.infoWindow.open(this.map, marker);
  //       this.selectedPap = pap;
  //       this._changeDetectorRef.detectChanges();
  //     });

  //     this.markers.push(marker);
  //   });
  // }

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
    if (this.paps.length == 0) return;

    const bounds = new google.maps.LatLngBounds();
    this.paps.forEach(pap => bounds.extend(pap.position));

    // this.map.fitBounds(bounds, {
    //   padding: 100,
    //   maxZoom: 14
    // });
  }

  closePopup(): void {
    this.infoWindow.close();
    this.selectedPap = null;
  }

}
