import { Component, Input, OnChanges, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

interface PapMultiPolygon {
  id: number;
  codePap: string;
  nom: string;
  prenom: string;
  commune: string;
  departement: string;
  multiPolygonGeometrique: string; 
  statutPap: string | null;
  perteTotale: number | null;
  [key: string]: any;
}

@Component({
  selector: 'app-pap-multi-polygon-leaflet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pap-multi-polygon-leaflet.component.html',
  styleUrl: './pap-multi-polygon-leaflet.component.css'
})
export class PapMultiPolygonLeafletComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() paps: PapMultiPolygon[] = [];
  @Input() isLoading: boolean = false;

  private map!: L.Map;
  private polygonLayers: L.Polygon[] = [];
  private markers: L.Marker[] = [];
  
  // ID unique pour chaque instance de carte
  mapId: string;

  // Coordonnées par défaut (Dakar, Sénégal)
  private defaultCenter: L.LatLngExpression = [14.716677, -17.467686];
  private defaultZoom = 13;

  constructor() {
    // Générer un ID unique pour cette instance
    this.mapId = `leaflet-polygon-map-${Math.random().toString(36).substr(2, 9)}`;
  }

  ngOnInit() {
    console.log('ngOnInit - PAPs reçus:', this.paps);
    console.log('ngOnInit - Nombre de PAPs:', this.paps?.length);
    this.initDefaultIcons();
  }

  ngOnChanges(changes: any) {
    console.log('ngOnChanges - Changements détectés:', changes);
    
    if (changes.paps && changes.paps.currentValue) {
      console.log('ngOnChanges - Nouvelles données PAPs:', changes.paps.currentValue);
      console.log('ngOnChanges - Nombre de PAPs:', changes.paps.currentValue.length);
      
      if (this.map) {
        this.updateMap();
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!this.map) {
        this.initMap();
        this.loadPolygons();
      }
    }, 100);
  }

  ngOnDestroy() {
    // Nettoyer les polygones
    this.polygonLayers.forEach(polygon => {
      polygon.remove();
    });
    this.polygonLayers = [];
    
    // Nettoyer les marqueurs
    this.markers.forEach(marker => {
      marker.remove();
    });
    this.markers = [];
    
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
    console.log('Initialisation de la carte avec ID:', this.mapId);
    
    const container = document.getElementById(this.mapId);
    if (!container) {
      console.error('Le conteneur de la carte n\'existe pas encore');
      return;
    }

    if ((container as any)._leaflet_id) {
      console.warn('Le conteneur a déjà une carte initialisée');
      return;
    }

    this.map = L.map(this.mapId, {
      center: this.defaultCenter,
      zoom: this.defaultZoom
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    console.log('Carte initialisée avec succès');
  }

  private loadPolygons(): void {
    console.log('Chargement des polygones...');
    console.log('Nombre de PAPs à traiter:', this.paps?.length);
    
    if (!this.paps || this.paps.length === 0) {
      console.log('Aucun PAP à afficher');
      return;
    }

    const bounds = L.latLngBounds([]);
    let hasValidPolygon = false;

    this.paps.forEach((pap, index) => {
      console.log(`\nTraitement PAP ${index + 1}/${this.paps.length}:`, {
        codePap: pap.codePap,
        nom: pap.nom,
        statut: pap.statutPap,
        hasGeometry: !!pap.multiPolygonGeometrique
      });

      if (!pap.multiPolygonGeometrique) {
        console.log(`PAP ${pap.codePap}: Pas de géométrie`);
        return;
      }

      const coordinates = this.parseMultiPolygonWKT(pap.multiPolygonGeometrique);
      
      if (coordinates.length === 0) {
        console.log(`PAP ${pap.codePap}: Aucune coordonnée valide après parsing`);
        return;
      }

      console.log(`PAP ${pap.codePap}: ${coordinates.length} coordonnées extraites`);

      // Créer le polygone avec les couleurs basées sur le statut
      const color = this.getColorByStatus(pap.statutPap);
      
      const polygon = L.polygon(coordinates, {
        color: color,
        fillColor: color,
        fillOpacity: 0.4,
        weight: 3
      }).addTo(this.map);

      // Ajouter le popup
      const popupContent = this.createPopupContent(pap);
      polygon.bindPopup(popupContent);

      this.polygonLayers.push(polygon);

      // Étendre les bounds
      coordinates.forEach(coord => {
        bounds.extend(coord);
      });
      hasValidPolygon = true;

      // Ajouter un marqueur au centre du polygone (optionnel, pour debug)
      if (coordinates.length > 0) {
        const center = this.getPolygonCenter(coordinates);
        const marker = L.marker(center, {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            iconSize: [20, 20],
            iconAnchor: [10, 20],
            popupAnchor: [0, -20]
          })
        }).addTo(this.map);
        
        marker.bindPopup(popupContent);
        this.markers.push(marker);
      }
    });

    console.log(`\nRésumé: ${this.polygonLayers.length} polygones créés`);

    // Ajuster la vue sur tous les polygones
    if (hasValidPolygon && bounds.isValid()) {
      console.log('Ajustement de la vue sur les polygones');
      this.map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      console.log('Aucun polygone valide, utilisation du centre par défaut');
    }
  }

  private parseMultiPolygonWKT(wkt: string): L.LatLngExpression[] {
    console.log('Parsing WKT:', wkt);
    
    try {
      const cleanWkt = wkt.trim().toUpperCase();
      let coordString = '';
      
      // Pattern 1: MULTIPOLYGON(((coords)))
      let match = cleanWkt.match(/MULTIPOLYGON\s*\(\s*\(\s*\(\s*([^)]+)\s*\)\s*\)\s*\)/);
      if (match) {
        coordString = match[1];
        console.log('Pattern MULTIPOLYGON trouvé');
      }
      
      // Pattern 2: POLYGON((coords))
      if (!match) {
        match = cleanWkt.match(/POLYGON\s*\(\s*\(\s*([^)]+)\s*\)\s*\)/);
        if (match) {
          coordString = match[1];
          console.log('Pattern POLYGON trouvé');
        }
      }
      
      // Pattern 3: Coordonnées brutes
      if (!match && wkt.includes(',') && wkt.includes(' ')) {
        coordString = wkt;
        console.log('Coordonnées brutes détectées');
      }
      
      if (!coordString) {
        console.log('Aucun pattern WKT reconnu');
        return [];
      }

      console.log('String de coordonnées extraite:', coordString.substring(0, 100) + '...');

      const coords = coordString.split(',')
        .map(coord => {
          const parts = coord.trim().split(/\s+/);
          
          if (parts.length >= 2) {
            const lng = parseFloat(parts[0]);
            const lat = parseFloat(parts[1]);
            
            if (isNaN(lat) || isNaN(lng)) {
              console.log('Coordonnées invalides (NaN):', { lat, lng });
              return null;
            }
            
            // Vérification des plages (Sénégal approximativement)
            if (lat < 12 || lat > 17 || lng < -18 || lng > -11) {
              console.log('Coordonnées hors plage Sénégal:', { lat, lng });
            }
            
            return [lat, lng] as L.LatLngExpression;
          }
          return null;
        })
        .filter(coord => coord !== null) as L.LatLngExpression[];

      console.log(`${coords.length} coordonnées valides extraites`);
      
      if (coords.length > 0) {
        console.log('Première coordonnée:', coords[0]);
        console.log('Dernière coordonnée:', coords[coords.length - 1]);
      }

      return coords;
    } catch (error) {
      console.error('Erreur lors du parsing WKT:', error);
      return [];
    }
  }

  private getPolygonCenter(coordinates: L.LatLngExpression[]): L.LatLngExpression {
    if (coordinates.length === 0) return this.defaultCenter;
    
    let latSum = 0;
    let lngSum = 0;
    
    coordinates.forEach(coord => {
      const [lat, lng] = coord as [number, number];
      latSum += lat;
      lngSum += lng;
    });
    
    return [latSum / coordinates.length, lngSum / coordinates.length];
  }

  private createPopupContent(pap: PapMultiPolygon): string {
    return `
      <div class="info-window">
        <h3>${pap.prenom} ${pap.nom}</h3>
        <p><strong>Code PAP:</strong> ${pap.codePap}</p>
        <p><strong>Commune:</strong> ${pap.commune}</p>
        <p><strong>Statut:</strong> ${this.getStatutLabel(pap.statutPap)}</p>
        <p><strong>Perte totale:</strong> ${this.formatNumber(pap.perteTotale)} FCFA</p>
        <div class="status-badge ${this.getStatusClass(pap.statutPap)}" 
             style="background-color: ${this.getColorByStatus(pap.statutPap)}; color: white;">
          ${this.getStatutLabel(pap.statutPap)}
        </div>
      </div>
    `;
  }

  private updateMap(): void {
    console.log('Mise à jour de la carte...');
    
    // Supprimer les anciens polygones
    this.polygonLayers.forEach(polygon => {
      polygon.remove();
    });
    this.polygonLayers = [];
    
    // Supprimer les anciens marqueurs
    this.markers.forEach(marker => {
      marker.remove();
    });
    this.markers = [];
    
    // Recharger les polygones
    this.loadPolygons();
  }

  private getColorByStatus(statut: string | null): string {
    console.log('Statut pour couleur:', statut);
    
    switch(statut) {
      case 'recense':
        return '#4285F4'; // Bleu
      case 'en_etude':
        return '#FBBC05'; // Jaune
      case 'indemnisation_terminee':
        return '#34A853'; // Vert
      default:
        return '#EA4335'; // Rouge
    }
  }

  getStatutLabel(statut: string | null): string {
    const labels: Record<string, string> = {
      'recense': 'Recensé',
      'en_etude': 'En étude',
      'indemnisation_terminee': 'Indemnisation terminée'
    };
    return statut ? labels[statut] || statut : 'Statut inconnu';
  }

  getStatusClass(statut: string | null): string {
    return statut ? `badge-${statut}` : 'badge-unknown';
  }

  private formatNumber(value: number | null): string {
    if (value === null || value === undefined) return '0';
    return value.toLocaleString('fr-FR');
  }
}