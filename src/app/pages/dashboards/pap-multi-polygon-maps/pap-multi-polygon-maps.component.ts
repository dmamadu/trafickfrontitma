import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { GoogleMapsModule, MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps';
import { CommonModule } from '@angular/common';

interface PapMultiPolygon {
  id: number;
  codePap: string;
  nom: string;
  prenom: string;
  commune: string;
  departement: string;
  multiPolygonGeometrique: string;  // Format WKT : "MultiPolygon(((...)))"
  statutPap: string | null;
  perteTotale: number | null;
  [key: string]: any;
}


@Component({
  selector: 'app-pap-multi-polygon-maps',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './pap-multi-polygon-maps.component.html',
  styleUrls: ['./pap-multi-polygon-maps.component.css']
})
// Component TypeScript
// export class PapMultiPolygonMapsComponent implements OnInit, OnChanges {
//   @ViewChild(MapInfoWindow, { static: false }) infoWindow?: MapInfoWindow;
//   @ViewChild(GoogleMap, { static: false }) map?: GoogleMap;

//   @Input() paps: PapMultiPolygon[] = [];
//   @Input() isLoading: boolean = false;

//   // Propriété pour stocker le PAP sélectionné (comme dans l'autre composant)
//   selectedPap: PapMultiPolygon | null = null;

//   center: google.maps.LatLngLiteral = { lat: 14.716677, lng: -17.467686 };
//   zoom = 13;
//   polygons: (google.maps.PolygonOptions & { papData: PapMultiPolygon })[] = [];

//   ngOnInit() {
//     console.log('ngOnInit - PAPs reçus:', this.paps);
//     console.log('ngOnInit - Nombre de PAPs:', this.paps.length);
    
//     // Ne charger les polygones que si on a des données
//     if (this.paps && this.paps.length > 0) {
//       this.loadPolygons();
//       setTimeout(() => {
//         this.adjustMapCenter();
//       }, 100);
//     } else {
//       console.log('Aucun PAP disponible dans ngOnInit, attente des données...');
//     }
//   }

//   // Ajouter cette méthode pour être appelée quand les données changent
//   ngOnChanges(changes: any) {
//     if (changes.paps && changes.paps.currentValue) {
//       console.log('ngOnChanges - Nouvelles données PAPs:', changes.paps.currentValue);
//       console.log('ngOnChanges - Nombre de PAPs:', changes.paps.currentValue.length);
      
//       this.loadPolygons();
//       setTimeout(() => {
//         this.adjustMapCenter();
//       }, 100);
//     }
//   }

//   // Parse WKT MultiPolygon et convertit en paths Google Maps
//   private loadPolygons() {
//     console.log('Chargement des polygones...');
    
//     this.polygons = this.paps
//       .filter(pap => {
//         const hasGeometry = !!pap.multiPolygonGeometrique;
//         // console.log(`PAP ${pap.codePap}: a géométrie = ${hasGeometry}`);
//         if (hasGeometry) {
//           console.log(`Géométrie: ${pap.multiPolygonGeometrique}`);
//         }
//         return hasGeometry;
//       })
//       .map(pap => {
//         const paths = this.parseMultiPolygonWKT(pap.multiPolygonGeometrique);
//         // console.log(`PAP ${pap.codePap}: ${paths.length} paths générés`);
//         if (paths.length === 0) {
//           // console.log(`Aucun path généré pour PAP ${pap.codePap}`);
//           return null;
//         }
        
//         const polygon = {
//           paths: paths,
//           strokeColor: this.getColorByStatus(pap.statutPap),
//           fillColor: this.getColorByStatus(pap.statutPap),
//           fillOpacity: 0.3,
//           strokeWeight: 2,
//           papData: pap
//         };
        
//         console.log(`Polygone créé pour PAP ${pap.codePap}:`, polygon);
//         return polygon;
//       })
//       .filter(polygon => polygon !== null) as (google.maps.PolygonOptions & { papData: PapMultiPolygon })[];
      
//     // console.log('Polygones finaux:', this.polygons);
//   }

//   // Extrait les coordonnées depuis le WKT (version améliorée)
//   private parseMultiPolygonWKT(wkt: string): google.maps.LatLngLiteral[][] {
//     console.log('Parsing WKT:', wkt);
    
//     try {
//       // Nettoyer le WKT
//       const cleanWkt = wkt.trim().toUpperCase();
      
//       // Essayer différents patterns
//       let coordString = '';
      
//       // Pattern 1: MULTIPOLYGON(((coords)))
//       let match = cleanWkt.match(/MULTIPOLYGON\s*\(\s*\(\s*\(\s*([^)]+)\s*\)\s*\)\s*\)/);
//       if (match) {
//         coordString = match[1];
//         console.log('Match MULTIPOLYGON trouvé');
//       }
      
//       // Pattern 2: POLYGON((coords))
//       if (!match) {
//         match = cleanWkt.match(/POLYGON\s*\(\s*\(\s*([^)]+)\s*\)\s*\)/);
//         if (match) {
//           coordString = match[1];
//           console.log('Match POLYGON trouvé');
//         }
//       }
      
//       // Pattern 3: Juste les coordonnées
//       if (!match) {
//         // Si c'est juste des coordonnées séparées par des virgules
//         if (wkt.includes(',') && wkt.includes(' ')) {
//           coordString = wkt;
//           console.log('Coordonnées brutes détectées');
//         }
//       }
      
//       if (!coordString) {
//         console.log('Aucun pattern WKT reconnu pour:', wkt);
//         return [];
//       }

//       console.log('Coordonnées string extraites:', coordString);

//       const coords = coordString.split(',').map(coord => {
//         const parts = coord.trim().split(/\s+/);
//         console.log('Parties de coordonnées:', parts);
        
//         if (parts.length >= 2) {
//           const lng = parseFloat(parts[0]);
//           const lat = parseFloat(parts[1]);
          
//           console.log('Coordonnées parsées:', { lat, lng });
          
//           // Vérifier que les coordonnées sont valides
//           if (isNaN(lat) || isNaN(lng)) {
//             console.log('Coordonnées invalides:', { lat, lng });
//             return null;
//           }
          
//           // Vérifier les plages de coordonnées (approximativement pour le Sénégal)
//           if (lat < 12 || lat > 17 || lng < -18 || lng > -11) {
//             console.log('Coordonnées hors plage Sénégal:', { lat, lng });
//           }
          
//           return { lat, lng };
//         }
//         return null;
//       }).filter(coord => coord !== null) as google.maps.LatLngLiteral[];

//       console.log('Coordonnées finales:', coords);
//       return coords.length > 0 ? [coords] : [];
//     } catch (error) {
//       console.error('Erreur lors du parsing WKT:', error);
//       return [];
//     }
//   }

//   private adjustMapCenter() {
//     if (this.polygons.length === 0 || !this.map) return;
//     const bounds = new google.maps.LatLngBounds();
//     let hasValidCoords = false;
//     this.polygons.forEach(polygon => {
//       if (polygon.paths && Array.isArray(polygon.paths)) {
//         polygon.paths.forEach(path => {
//           if (Array.isArray(path)) {
//             path.forEach(coord => {
//               if (coord && typeof coord.lat === 'number' && typeof coord.lng === 'number') {
//                 bounds.extend(coord);
//                 hasValidCoords = true;
//               }
//             });
//           }
//         });
//       }
//     });
//     if (hasValidCoords) {
//       this.map.fitBounds(bounds);
//     }
//   }
//   private getColorByStatus(statut: string | null): string {
//     switch(statut) {
//       case 'recense': return '#4285F4'; // Bleu
//       case 'en_etude': return '#FBBC05'; // Jaune
//       case 'indemnisation_terminee': return '#34A853'; // Vert
//       default: return '#EA4335'; // Rouge
//     }
//   }

//   // Méthode pour ouvrir l'infoWindow (corrigée)
//   openInfoWindow(papData: any, event: any) {
//     this.selectedPap = papData;
//     console.log('Ouverture de l\'infoWindow pour PAP:', papData);
    
//     // Créer un marker invisible pour pouvoir ouvrir l'infoWindow
//     const marker = new google.maps.Marker({
//       position: event.latLng,
//       map: this.map?.googleMap,
//       visible: false
//     });

//     // Créer un MapMarker wrapper pour l'infoWindow
//     const mapMarker = {
//       marker: marker,
//       getPosition: () => event.latLng
//     } as any;

//     this.infoWindow?.open(mapMarker);
//   }

//   // Méthodes utilitaires
//   getStatutLabel(statut: string | null): string {
//     const labels: Record<string, string> = {
//       'recense': 'Recensé',
//       'en_etude': 'En étude',
//       'indemnisation_terminee': 'Indemnisation terminée'
//     };
//     return statut ? labels[statut] || statut : 'Statut inconnu';
//   }

//   getStatusClass(statut: string | null): string {
//     return statut ? `badge-${statut}` : 'badge-unknown';
//   }

//   // Méthode de tracking pour optimiser les performances
//   trackByPapId(index: number, polygon: any): any {
//     return polygon.papData?.codePap || index;
//   }
// }
export class PapMultiPolygonMapsComponent implements OnInit, OnChanges {
  @ViewChild(MapInfoWindow, { static: false }) infoWindow?: MapInfoWindow;
  @ViewChild(GoogleMap, { static: false }) map?: GoogleMap;

  @Input() paps: PapMultiPolygon[] = [];
  @Input() isLoading: boolean = false;

  // Propriété pour stocker le PAP sélectionné (comme dans l'autre composant)
  selectedPap: PapMultiPolygon | null = null;

  center: google.maps.LatLngLiteral = { lat: 14.716677, lng: -17.467686 };
  zoom = 13;
  polygons: (google.maps.PolygonOptions & { papData: PapMultiPolygon })[] = [];

  ngOnInit() {
    console.log('ngOnInit - PAPs reçus:', this.paps);
    console.log('ngOnInit - Nombre de PAPs:', this.paps.length);
    
    // Ne charger les polygones que si on a des données
    if (this.paps && this.paps.length > 0) {
      this.loadPolygons();
      setTimeout(() => {
        this.adjustMapCenter();
      }, 100);
    } else {
      console.log('Aucun PAP disponible dans ngOnInit, attente des données...');
    }
  }

  // Ajouter cette méthode pour être appelée quand les données changent
  ngOnChanges(changes: any) {
    if (changes.paps && changes.paps.currentValue) {
      console.log('ngOnChanges - Nouvelles données PAPs:', changes.paps.currentValue);
      console.log('ngOnChanges - Nombre de PAPs:', changes.paps.currentValue.length);
      
      this.loadPolygons();
      setTimeout(() => {
        this.adjustMapCenter();
      }, 100);
    }
  }

  // Parse WKT MultiPolygon et convertit en paths Google Maps
  private loadPolygons() {
    console.log('Chargement des polygones...');
    
    this.polygons = this.paps
      .filter(pap => {
        const hasGeometry = !!pap.multiPolygonGeometrique;
        console.log(`PAP ${pap.codePap}: a géométrie = ${hasGeometry}, statut = ${pap.statutPap}`);
        if (hasGeometry) {
          console.log(`Géométrie: ${pap.multiPolygonGeometrique}`);
        }
        return hasGeometry;
      })
      .map(pap => {
        const paths = this.parseMultiPolygonWKT(pap.multiPolygonGeometrique);
        console.log(`PAP ${pap.codePap}: ${paths.length} paths générés`);
        
        if (paths.length === 0) {
          console.log(`Aucun path généré pour PAP ${pap.codePap}`);
          return null;
        }
        
        const strokeColor = this.getColorByStatus(pap.statutPap);
        const fillColor = this.getColorByStatus(pap.statutPap);
        
        const polygon = {
          paths: paths,
          strokeColor: strokeColor,
          fillColor: fillColor,
          fillOpacity: 0.4, // Augmenté pour mieux voir les couleurs
          strokeWeight: 3,   // Augmenté pour mieux voir les contours
          papData: pap
        };
        
        console.log(`Polygone créé pour PAP ${pap.codePap}:`, {
          statut: pap.statutPap,
          strokeColor,
          fillColor,
          paths: paths.length
        });
        return polygon;
      })
      .filter(polygon => polygon !== null) as (google.maps.PolygonOptions & { papData: PapMultiPolygon })[];
      
    console.log('Polygones finaux:', this.polygons);
  }

  // Extrait les coordonnées depuis le WKT (version améliorée)
  private parseMultiPolygonWKT(wkt: string): google.maps.LatLngLiteral[][] {
    console.log('Parsing WKT:', wkt);
    
    try {
      // Nettoyer le WKT
      const cleanWkt = wkt.trim().toUpperCase();
      
      // Essayer différents patterns
      let coordString = '';
      
      // Pattern 1: MULTIPOLYGON(((coords)))
      let match = cleanWkt.match(/MULTIPOLYGON\s*\(\s*\(\s*\(\s*([^)]+)\s*\)\s*\)\s*\)/);
      if (match) {
        coordString = match[1];
        console.log('Match MULTIPOLYGON trouvé');
      }
      
      // Pattern 2: POLYGON((coords))
      if (!match) {
        match = cleanWkt.match(/POLYGON\s*\(\s*\(\s*([^)]+)\s*\)\s*\)/);
        if (match) {
          coordString = match[1];
          console.log('Match POLYGON trouvé');
        }
      }
      
      // Pattern 3: Juste les coordonnées
      if (!match) {
        // Si c'est juste des coordonnées séparées par des virgules
        if (wkt.includes(',') && wkt.includes(' ')) {
          coordString = wkt;
          console.log('Coordonnées brutes détectées');
        }
      }
      
      if (!coordString) {
        console.log('Aucun pattern WKT reconnu pour:', wkt);
        return [];
      }

      console.log('Coordonnées string extraites:', coordString);

      const coords = coordString.split(',').map(coord => {
        const parts = coord.trim().split(/\s+/);
        console.log('Parties de coordonnées:', parts);
        
        if (parts.length >= 2) {
          const lng = parseFloat(parts[0]);
          const lat = parseFloat(parts[1]);
          
          console.log('Coordonnées parsées:', { lat, lng });
          
          // Vérifier que les coordonnées sont valides
          if (isNaN(lat) || isNaN(lng)) {
            console.log('Coordonnées invalides:', { lat, lng });
            return null;
          }
          
          // Vérifier les plages de coordonnées (approximativement pour le Sénégal)
          if (lat < 12 || lat > 17 || lng < -18 || lng > -11) {
            console.log('Coordonnées hors plage Sénégal:', { lat, lng });
          }
          
          return { lat, lng };
        }
        return null;
      }).filter(coord => coord !== null) as google.maps.LatLngLiteral[];

      console.log('Coordonnées finales:', coords);
      return coords.length > 0 ? [coords] : [];
    } catch (error) {
      console.error('Erreur lors du parsing WKT:', error);
      return [];
    }
  }

  // Ajuste le centrage de la carte sur les polygones
  private adjustMapCenter() {
    if (this.polygons.length === 0 || !this.map) return;

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoords = false;

    this.polygons.forEach(polygon => {
      if (polygon.paths && Array.isArray(polygon.paths)) {
        polygon.paths.forEach(path => {
          if (Array.isArray(path)) {
            path.forEach(coord => {
              if (coord && typeof coord.lat === 'number' && typeof coord.lng === 'number') {
                bounds.extend(coord);
                hasValidCoords = true;
              }
            });
          }
        });
      }
    });

    if (hasValidCoords) {
      this.map.fitBounds(bounds);
    }
  }

  // Couleur basée sur le statut
  getColorByStatus(statut: string | null): string {
    console.log('Statut reçu pour couleur:', statut);
    
    switch(statut) {
      case 'recense':
        return '#4285F4'; // Bleu
      case 'en_etude':
        return '#FBBC05'; // Jaune
      case 'indemnisation_terminee':
        return '#34A853'; // Vert
      case null:
      case undefined:
      case '':
        return '#EA4335'; // Rouge pour statut vide/null
      default:
        console.log('Statut non reconnu:', statut);
        return '#EA4335'; // Rouge par défaut
    }
  }

  // Méthode pour ouvrir l'infoWindow (version simplifiée)
  openInfoWindow(papData: PapMultiPolygon, event: any) {
    console.log('Clic sur polygone - papData:', papData);
    console.log('Clic sur polygone - event:', event);
    console.log('Clic sur polygone - event.latLng:', event.latLng);
    
    // Stocker le PAP sélectionné
    this.selectedPap = papData;
    console.log('selectedPap après assignation:', this.selectedPap);
    
    // Créer un marker temporaire pour l'InfoWindow
    if (this.map?.googleMap && event.latLng) {
      const tempMarker = new google.maps.Marker({
        position: event.latLng,
        map: this.map.googleMap,
        visible: false // Marker invisible
      });
      
      // Wrapper pour l'InfoWindow Angular
      const markerWrapper = {
        marker: tempMarker,
        getPosition: () => event.latLng,
        getMap: () => this.map?.googleMap
      };
      
      // Attendre un peu puis ouvrir l'InfoWindow
      setTimeout(() => {
        console.log('Tentative d\'ouverture InfoWindow avec:', this.selectedPap);
        this.infoWindow?.open(markerWrapper as any);
      }, 100);
    } else {
      console.error('Impossible d\'ouvrir InfoWindow - map ou latLng manquant');
    }
  }

  // Méthodes utilitaires
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

  // Méthode de tracking pour optimiser les performances
  trackByPapId(index: number, polygon: any): any {
    return polygon.papData?.codePap || index;
  }
}
