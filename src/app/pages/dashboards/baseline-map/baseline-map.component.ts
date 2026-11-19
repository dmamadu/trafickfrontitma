import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import { GoogleMap, GoogleMapsModule, MapInfoWindow, MapMarker } from "@angular/google-maps";

export interface PointPap {
  codePap: string;
  prenom: string | null;
  nom: string | null;
  categorie: string;
  statut: "recense" | "en_etude" | "terminee" | "inconnu" | string;
  zone: string | null;
  lat: number;
  lng: number;
}

export const STATUTS_PAP: { key: string; label: string; color: string }[] = [
  { key: "recense", label: "Recensé", color: "#2563eb" },
  { key: "en_etude", label: "En étude", color: "#e0a100" },
  { key: "terminee", label: "Indemnisation terminée", color: "#2e7d32" },
  { key: "inconnu", label: "Statut inconnu", color: "#8a8580" },
];

/**
 * Carte unique du tableau de bord Baseline : un point par PAP, coloré par statut d'indemnisation,
 * et l'enveloppe des PAP en pointillés (« emprise »). Le cadrage est recalculé à chaque
 * changement des points (et non à l'initialisation, avant l'arrivée des données — cf. INV-01).
 */
@Component({
  selector: "app-baseline-map",
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: "./baseline-map.component.html",
  styleUrl: "./baseline-map.component.css",
})
export class BaselineMapComponent implements OnInit, OnChanges {
  @Input() points: PointPap[] = [];

  @ViewChild(GoogleMap) map?: GoogleMap;
  @ViewChild(MapInfoWindow) infoWindow?: MapInfoWindow;

  readonly statuts = STATUTS_PAP;
  readonly libellesCategorie: Record<string, string> = {
    placeAffaire: "Place d'affaires",
    agricole: "Agricole",
    habitat: "Habitat",
  };

  mapsReady = false;
  mapType: "roadmap" | "satellite" = "roadmap";
  center: google.maps.LatLngLiteral = { lat: 14.7167, lng: -17.4677 };
  zoom = 13;
  options: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: "cooperative",
  };
  emprise: google.maps.LatLngLiteral[] = [];
  readonly empriseOptions: google.maps.PolygonOptions = {
    strokeColor: "#a8480a",
    strokeOpacity: 0,
    fillColor: "#a8480a",
    fillOpacity: 0.06,
    clickable: false,
  };
  empriseLigneOptions: google.maps.PolylineOptions = {};
  selection: PointPap | null = null;
  private icones: Record<string, google.maps.Symbol> = {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.attendreGoogle().then(() => {
      for (const s of STATUTS_PAP) {
        this.icones[s.key] = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: s.color,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        };
      }
      // Contour en tirets (Google Maps n'a pas d'option « dashed » sur les polygones).
      this.empriseLigneOptions = {
        strokeOpacity: 0,
        clickable: false,
        icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 0.9, strokeColor: "#a8480a", scale: 2 }, offset: "0", repeat: "10px" }],
      };
      // Zoom en haut à droite : la légende occupe le coin bas droit.
      this.options = { ...this.options, zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP } };
      this.mapsReady = true;
      this.cdr.detectChanges();
      this.cadrer();
    });
  }

  ngOnChanges(): void {
    this.emprise = this.enveloppe(this.points);
    if (this.mapsReady) setTimeout(() => this.cadrer());
  }

  icone(p: PointPap): google.maps.MarkerOptions {
    return { icon: this.icones[p.statut] ?? this.icones["inconnu"], title: p.codePap };
  }

  ouvrir(marker: MapMarker, p: PointPap): void {
    this.selection = p;
    this.infoWindow?.open(marker);
  }

  statutLabel(key: string): string {
    return STATUTS_PAP.find((s) => s.key === key)?.label ?? "Statut inconnu";
  }

  setType(type: "roadmap" | "satellite"): void {
    this.mapType = type;
    this.map?.googleMap?.setMapTypeId(type);
  }

  get empriseFermee(): google.maps.LatLngLiteral[] {
    return this.emprise.length ? [...this.emprise, this.emprise[0]] : [];
  }

  private cadrer(): void {
    const gm = this.map?.googleMap;
    if (!gm || !this.points.length) return;
    if (this.points.length === 1) {
      gm.setCenter({ lat: this.points[0].lat, lng: this.points[0].lng });
      gm.setZoom(16);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    this.points.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    gm.fitBounds(bounds, 40);
  }

  /** Enveloppe convexe (algorithme de la chaîne monotone). */
  private enveloppe(points: PointPap[]): google.maps.LatLngLiteral[] {
    const pts = points.map((p) => ({ lat: p.lat, lng: p.lng })).sort((a, b) => a.lng - b.lng || a.lat - b.lat);
    if (pts.length < 3) return [];
    const cross = (o: any, a: any, b: any) => (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng);
    const lower: google.maps.LatLngLiteral[] = [];
    for (const p of pts) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
      lower.push(p);
    }
    const upper: google.maps.LatLngLiteral[] = [];
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
      upper.push(p);
    }
    return [...lower.slice(0, -1), ...upper.slice(0, -1)];
  }

  private attendreGoogle(): Promise<void> {
    return new Promise((resolve) => {
      const pret = () => typeof google !== "undefined" && !!google.maps;
      if (pret()) return resolve();
      const t = setInterval(() => {
        if (pret()) {
          clearInterval(t);
          resolve();
        }
      }, 100);
    });
  }
}
