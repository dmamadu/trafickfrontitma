import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { LocalService } from 'src/app/core/services/local.service';
import { ServiceParent } from 'src/app/core/services/serviceParent';

interface Pap {
  id: number;
  codePap: string;
  nom: string;
  prenom: string;
  commune: string;
  departement: string;
  pointGeometriques: string;
  statutPap: string | null;
  perteTotale: number | null;
  [key: string]: any;
}

@Component({
  selector: 'app-pap-google-maps',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './pap-google-maps.component.html',
  styleUrl: './pap-google-maps.component.css'
})
export class PapGoogleMapsComponent implements OnInit {

  @ViewChild(MapInfoWindow, { static: false }) infoWindow?: MapInfoWindow;

  infoContent: string = '';


   paps: Pap[] = [];
    currentProjectId: any;

  // Position par défaut (Dakar)
  center: google.maps.LatLngLiteral = { lat: 14.716677, lng: -17.467686 };
  zoom = 13;

    constructor(
      private parentService: ServiceParent,
      private localService: LocalService,
    ) {
      this.currentProjectId = this.localService.getData("ProjectId");
    }

  ngOnInit() {
    this.loadPaps();
    // Ajuster le centrage si on a des positions valides
    const validPaps = this.paps.filter(pap => this.getPosition(pap) !== null);
    if (validPaps.length > 0) {
      const positions = validPaps.map(pap => this.getPosition(pap));
      this.center = this.calculateCenter(positions);
    }
    this.addPolyline();

  }


//  loadPaps(): void {
//   this.parentService.list("databasePapPlaceAffaire", 1000, 0, this.currentProjectId)
//     .subscribe({
//       next: (data: any) => {
//         if (data.responseCode === 200) {
//           this.paps = data.data
//         }
//       },
//       error: (err) => {
//         console.error(err);
//       }
//     });
// }

isLoading: boolean = false;

loadPaps(): void {
  this.isLoading = true; // Active le loader avant la requête
  
  this.parentService.list("databasePapPlaceAffaire", 1000, 0, this.currentProjectId)
    .subscribe({
      next: (data: any) => {
        if (data.responseCode === 200) {
          this.paps = data.data;
        }
        this.isLoading = false; // Désactive le loader après réception des données
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false; // Désactive le loader en cas d'erreur
      }
    });
}

  getPosition(pap: Pap): google.maps.LatLngLiteral | null {
    if (!pap.pointGeometriques) return null;
    const match = pap.pointGeometriques.match(/Point \(([-\d.]+) ([-\d.]+)\)/);
    if (match && match.length === 3) {
      return {
        lng: parseFloat(match[1]),
        lat: parseFloat(match[2])
      };
    }
    return null;
  }

  calculateCenter(positions: google.maps.LatLngLiteral[]): google.maps.LatLngLiteral {
    if (positions.length === 0) return this.center;
    
    if (positions.length === 1) return positions[0];
    
    // Calculer une position moyenne pour plusieurs points
    const lats = positions.map(p => p.lat);
    const lngs = positions.map(p => p.lng);
    
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    
    return { lat: avgLat, lng: avgLng };
  }

  getMarkerOptions(pap: Pap): google.maps.MarkerOptions {
    const icon = {
      url: this.getMarkerIcon(pap.statutPap),
      scaledSize: new google.maps.Size(32, 32)
    };
    
    return {
      draggable: false,
      icon: icon
    };
  }

  getMarkerIcon(statut: string | null): string {
    switch(statut) {
      case 'recense':
        return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      case 'en_etude':
        return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case 'indemnisation_terminee':
        return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
      default:
        return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
  }

  getStatutLabel(statut: string | null): string {
    if (!statut) return 'Statut inconnu';
    
    const labels: {[key: string]: string} = {
      'recense': 'Recensé',
      'en_etude': 'En étude',
      'indemnisation_terminee': 'Indemnisation terminée',
      'null': 'Indéfini',
    };
    
    return labels[statut] || statut;
  }

  getStatusClass(statut: string | null): string {
    if (!statut) return 'badge-unknown';
    
    return `badge-${statut}`;
  }




    openMapInfo(content: string, marker: MapMarker): void {
    this.infoContent = content;
    this.infoWindow?.open(marker);
  }

    markers: Set<google.maps.Marker> = new Set();


     polylineOptions: google.maps.PolylineOptions = {
    path: [],
    strokeColor: '#F78F08',
    strokeOpacity: 1.0,
    strokeWeight: 5,
    draggable: false
  }

  addPolyline(): void {
    const markers = Array.from(this.markers).slice(-2);
    const path: google.maps.LatLng[] = [];
    markers.forEach((marker, index) => {
      path.push(new google.maps.LatLng(marker.getPosition()!));
    });
    this.polylineOptions = { ...this.polylineOptions, path };
    this.markers = new Set(markers);
  }

}
