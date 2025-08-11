import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Subject, takeUntil } from 'rxjs';
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
// Component TypeScript
export class PapGoogleMapsComponent implements OnInit, OnDestroy {
  @ViewChild(MapInfoWindow, { static: false }) infoWindow?: MapInfoWindow;
  
  // Propriété pour stocker le PAP sélectionné
  selectedPap: any = null;
  
  @Input() paps: any[];
  currentProjectId: any;
  @Input() isLoading: boolean = false;
  center: google.maps.LatLngLiteral = { lat: 14.716677, lng: -17.467686 };
  zoom = 13;

  constructor(
    private localService: LocalService,
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");
  }

  ngOnInit() {
    const validPaps = this.paps.filter(pap => this.getPosition(pap) !== null);
    if (validPaps.length > 0) {
      const positions = validPaps.map(pap => this.getPosition(pap));
      this.center = this.calculateCenter(positions);
    }
    this.addPolyline();
  }

  private destroy$ = new Subject<void>();
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getPosition(pap: any): google.maps.LatLngLiteral | null {
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
    
    const lats = positions.map(p => p.lat);
    const lngs = positions.map(p => p.lng);
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    
    return { lat: avgLat, lng: avgLng };
  }

  getMarkerOptions(pap: any): google.maps.MarkerOptions {
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

  // Méthode modifiée pour gérer correctement l'affichage des infos
  openMapInfo(pap: any, marker: MapMarker): void {
    this.selectedPap = pap; // Stocker le PAP sélectionné
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