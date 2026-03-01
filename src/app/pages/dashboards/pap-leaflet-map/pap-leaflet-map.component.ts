import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, AfterViewInit, OnChanges } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LocalService } from 'src/app/core/services/local.service';
import * as L from 'leaflet';

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
  selector: 'app-pap-leaflet-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pap-leaflet-map.component.html',
  styleUrl: './pap-leaflet-map.component.css'
})
export class PapLeafletMapComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() paps: any[] = [];
  @Input() isLoading: boolean = false;
  
  currentProjectId: any;
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private polyline!: L.Polyline;
  private destroy$ = new Subject<void>();

  // ID unique pour chaque instance de carte
  mapId: string;

  // Coordonnées par défaut (Dakar, Sénégal)
  private defaultCenter: L.LatLngExpression = [14.716677, -17.467686];
  private defaultZoom = 13;

  constructor(private localService: LocalService) {
    this.currentProjectId = this.localService.getData("ProjectId");
    // Générer un ID unique pour cette instance
    this.mapId = `leaflet-map-${Math.random().toString(36).substr(2, 9)}`;
  }

  ngOnInit() {
    // Initialisation des icônes Leaflet par défaut
    this.initDefaultIcons();
  }

  ngOnChanges(changes: any) {
    // Réinitialiser la carte si les données PAPs changent
    if (changes.paps && !changes.paps.firstChange && this.map) {
      this.updateMap();
    }
  }

  ngAfterViewInit() {
    // Initialiser la carte après que la vue soit prête
    setTimeout(() => {
      if (!this.map) {
        this.initMap();
        this.addMarkersToMap();
        this.addPolyline();
      }
    }, 100);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Nettoyer les marqueurs
    this.markers.forEach(marker => {
      marker.remove();
    });
    this.markers = [];
    
    // Supprimer la polyligne
    if (this.polyline) {
      this.polyline.remove();
    }
    
    // Supprimer la carte
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null as any;
    }
  }

  private initDefaultIcons() {
    // Fix pour les icônes par défaut de Leaflet
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  private initMap(): void {
    // Vérifier si le conteneur existe
    const container = document.getElementById(this.mapId);
    if (!container) {
      console.error('Le conteneur de la carte n\'existe pas encore');
      return;
    }

    // Vérifier si le conteneur a déjà une carte
    if ((container as any)._leaflet_id) {
      console.warn('Le conteneur a déjà une carte initialisée');
      return;
    }

    // Créer la carte avec l'ID unique
    this.map = L.map(this.mapId, {
      center: this.defaultCenter,
      zoom: this.defaultZoom
    });

    // Ajouter la couche de tuiles (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Calculer et ajuster le centre si des PAPs valides existent
    const validPaps = this.paps.filter(pap => this.getPosition(pap) !== null);
    if (validPaps.length > 0) {
      const positions = validPaps.map(pap => this.getPosition(pap)!);
      const center = this.calculateCenter(positions);
      this.map.setView([center.lat, center.lng], this.defaultZoom);
    }
  }

  private addMarkersToMap(): void {
    this.paps.forEach(pap => {
      const position = this.getPosition(pap);
      if (position) {
        const marker = L.marker([position.lat, position.lng], {
          icon: this.getMarkerIcon(pap.statutPap)
        });

        // Créer le popup
        const popupContent = this.createPopupContent(pap);
        marker.bindPopup(popupContent);

        // Ajouter le marker à la carte
        marker.addTo(this.map);
        this.markers.push(marker);
      }
    });
  }

  private createPopupContent(pap: any): string {
    return `
      <div class="info-window">
        <h3>${pap.prenom} ${pap.nom}</h3>
        <p><strong>Code PAP:</strong> ${pap.codePap}</p>
        <p><strong>Commune:</strong> ${pap.commune}</p>
        <p><strong>Statut:</strong> ${this.getStatutLabel(pap.statutPap)}</p>
        <p><strong>Perte totale:</strong> ${this.formatNumber(pap.perteTotale)} FCFA</p>
        <div class="status-badge ${this.getStatusClass(pap.statutPap)}">
          ${this.getStatutLabel(pap.statutPap)}
        </div>
      </div>
    `;
  }

  getPosition(pap: any): { lat: number; lng: number } | null {
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

  calculateCenter(positions: { lat: number; lng: number }[]): { lat: number; lng: number } {
    if (positions.length === 0) return { lat: 14.716677, lng: -17.467686 };
    if (positions.length === 1) return positions[0];
    
    const lats = positions.map(p => p.lat);
    const lngs = positions.map(p => p.lng);
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    
    return { lat: avgLat, lng: avgLng };
  }

  private getMarkerIcon(statut: string | null): L.Icon {
    const iconUrl = this.getMarkerIconUrl(statut);
    
    return L.icon({
      iconUrl: iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  }

  private getMarkerIconUrl(statut: string | null): string {
    // Utiliser des marqueurs colorés de Leaflet
    const baseUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-';
    
    switch(statut) {
      case 'recense':
        return baseUrl + 'blue.png';
      case 'en_etude':
        return baseUrl + 'yellow.png';
      case 'indemnisation_terminee':
        return baseUrl + 'green.png';
      default:
        return baseUrl + 'red.png';
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

  private formatNumber(value: number | null): string {
    if (value === null || value === undefined) return '0';
    return value.toLocaleString('fr-FR');
  }

  private addPolyline(): void {
    if (this.markers.length < 2) return;
    
    // Prendre les deux derniers marqueurs
    const lastTwoMarkers = this.markers.slice(-2);
    const latlngs: L.LatLngExpression[] = lastTwoMarkers.map(marker => 
      marker.getLatLng()
    );

    // Créer la polyligne
    this.polyline = L.polyline(latlngs, {
      color: '#F78F08',
      weight: 5,
      opacity: 1.0
    }).addTo(this.map);
  }

  private updateMap(): void {
    // Supprimer les anciens marqueurs
    this.markers.forEach(marker => {
      marker.remove();
    });
    this.markers = [];
    
    // Supprimer l'ancienne polyligne
    if (this.polyline) {
      this.polyline.remove();
    }
    
    // Ajouter les nouveaux marqueurs
    this.addMarkersToMap();
    
    // Recalculer le centre
    const validPaps = this.paps.filter(pap => this.getPosition(pap) !== null);
    if (validPaps.length > 0) {
      const positions = validPaps.map(pap => this.getPosition(pap)!);
      const center = this.calculateCenter(positions);
      this.map.setView([center.lat, center.lng], this.defaultZoom);
    }
    
    // Ajouter la nouvelle polyligne
    this.addPolyline();
  }
}