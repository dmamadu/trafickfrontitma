import { CommonModule, registerLocaleData } from "@angular/common";
import localeFr from "@angular/common/locales/fr";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ActivatedRoute, RouterModule } from "@angular/router";
import * as L from "leaflet";
import { EntenteService } from "src/app/core/services/entente.service";
import { LocalService } from "src/app/core/services/local.service";
import { ImageModalComponent } from "src/app/shared/image-modal.component";

registerLocaleData(localeFr, "fr");

type Onglet = "compensation" | "processus" | "pieces";

const STATUTS: Record<string, { libelle: string; badge: string }> = {
  BROUILLON: { libelle: "Brouillon", badge: "inv-badge--warning" },
  SYNCHRONISEE: { libelle: "Synchronisée", badge: "inv-badge--info" },
  FINALISEE: { libelle: "Finalisée", badge: "inv-badge--success" },
};

const CATEGORIES: Record<string, string> = {
  PAPAGRICOLE: "Agricole",
  PAPPLACEAFFAIRE: "Place d'affaires",
  PAPHABITAT: "Habitat",
  PAPECONOMIQUE: "Opérateur économique",
};

interface Poste {
  libelle: string;
  detail: string;
  montant: number;
}

interface Etape {
  libelle: string;
  faite: boolean;
  enCours: boolean;
  date: string | null;
  champs: { libelle: string; valeur: string }[];
}

/** Lit "Point (lng lat)" (format WKT de l'import) ; tolère "POINT(...)" et la virgule. */
function lirePoint(valeur: string | null | undefined): L.LatLngTuple | null {
  if (!valeur) return null;
  const m = valeur.match(/point\s*\(\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*\)/i);
  if (!m) return null;
  const lng = parseFloat(m[1]);
  const lat = parseFloat(m[2]);
  return isFinite(lat) && isFinite(lng) ? [lat, lng] : null;
}

/**
 * Fiche d'une entente de compensation (ententeCompensation/detail?id=12).
 * L'entente est relue sur le serveur : le lien peut être partagé ou actualisé.
 */
@Component({
  selector: "app-detail-entente",
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: "./detail-entente.component.html",
  styleUrl: "./detail-entente.component.css",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailEntenteComponent implements OnInit, OnDestroy {
  entente: any = null;
  chargement = false;
  erreur = false;
  onglet: Onglet = "compensation";

  postes: Poste[] = [];
  sommePostes = 0;
  etapes: Etape[] = [];
  etapesFaites = 0;
  position: L.LatLngTuple | null = null;

  private carte: L.Map | null = null;
  private conteneurCarte?: ElementRef<HTMLDivElement>;

  /** Le conteneur n'existe que dans l'onglet Compensation : la carte suit son cycle de vie. */
  @ViewChild("carte") set carteRef(ref: ElementRef<HTMLDivElement> | undefined) {
    this.conteneurCarte = ref;
    if (ref) {
      setTimeout(() => this.afficherCarte());
    } else {
      this.detruireCarte();
    }
  }

  constructor(
    private route: ActivatedRoute,
    private ententeService: EntenteService,
    private localService: LocalService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.queryParamMap.get("id"));
    const projectId = Number(this.localService.getData("ProjectId"));
    if (!id || !projectId) return;

    this.chargement = true;
    this.ententeService.getEntenteDetails(id, projectId).subscribe({
      next: (e: any) => {
        this.chargement = false;
        this.entente = e;
        this.preparer(e);
        this.cdr.markForCheck();
      },
      error: () => {
        this.chargement = false;
        this.erreur = true;
        this.cdr.markForCheck();
      },
    });
  }

  ngOnDestroy(): void {
    this.detruireCarte();
  }

  // ── Libellés ─────────────────────────────────────────────
  get nomComplet(): string {
    return [this.entente?.prenom, this.entente?.nom].filter(Boolean).join(" ") || "PAP sans nom";
  }
  get categorie(): string {
    return CATEGORIES[this.entente?.papType] ?? this.entente?.categorie ?? "";
  }
  get statut() {
    return STATUTS[this.entente?.statut] ?? null;
  }
  get estVulnerable(): boolean {
    const v = (this.entente?.vulnerabilite ?? "").trim();
    return !!v && !/^non/i.test(v);
  }
  get etapeEnCours(): Etape | undefined {
    return this.etapes.find((e) => e.enCours);
  }
  get ecartTotal(): boolean {
    const total = this.entente?.perteTotale;
    return total != null && this.postes.length > 0 && Math.round(total) !== Math.round(this.sommePostes);
  }

  choisirOnglet(o: Onglet): void {
    this.onglet = o;
  }

  estUneImage(valeur: string | null | undefined): boolean {
    return !!valeur && /^https?:\/\//i.test(valeur);
  }

  ouvrirImage(url: string): void {
    if (url) this.dialog.open(ImageModalComponent, { data: { imageUrl: url } });
  }

  // ── Préparation des données ──────────────────────────────
  private preparer(e: any): void {
    const parcelle = [
      e.superficie ? `${e.superficie} m²` : "",
      e.codeParcelle ? `parcelle ${e.codeParcelle}` : "",
    ].filter(Boolean).join(", ");

    const arbresDetailles = (e.perteArbreJeune ?? 0) > 0 || (e.perteArbreAdulte ?? 0) > 0;
    const candidats: Poste[] = [
      { libelle: "Terre", detail: parcelle || e.caracteristiqueParcelle || "", montant: e.perteTerre },
      { libelle: "Bâtiment", detail: "", montant: e.perteBatiment },
      { libelle: "Perte de loyer", detail: "", montant: e.perteLoyer },
      { libelle: "Clôture", detail: "", montant: e.perteCloture },
      ...(arbresDetailles
        ? [
            { libelle: "Arbres jeunes", detail: "", montant: e.perteArbreJeune },
            { libelle: "Arbres adultes", detail: "", montant: e.perteArbreAdulte },
          ]
        : [{ libelle: "Arbres", detail: "", montant: e.perteTotaleArbre }]),
      { libelle: "Équipements", detail: "", montant: e.perteEquipement },
      { libelle: "Perte de revenu", detail: e.activitePrincipale || "", montant: e.perteRevenue },
      { libelle: "Frais de déplacement", detail: "", montant: e.fraisDeplacement },
      { libelle: "Appui à la relocalisation", detail: "", montant: e.appuiRelocalisation },
    ];
    this.postes = candidats.filter((p) => (p.montant ?? 0) > 0);
    this.sommePostes = this.postes.reduce((s, p) => s + p.montant, 0);

    const definitions: [string, boolean, string | null, [string, any][]][] = [
      ["Compensation établie", e.compensationEtablie, e.dateEtablissementCompensation, []],
      ["PAP informée", e.papInformee, e.dateInformationPap, [
        ["Mode d'information", e.modeInformation],
        ["Détails", e.detailsInformation],
      ]],
      ["Accord PAP obtenu", e.accordPapObtenu, e.dateAccordPap, []],
      ["Paiement effectué", e.paiementEffectue, e.datePaiement, []],
      ["Formation donnée", e.formationDonnee, e.dateFormation, [
        ["Type de formation", e.typeFormation],
        ["Formateur", e.formateur],
      ]],
      ["Suivi effectué", e.suiviEffectue, e.dateSuivi, [
        ["Résultat", e.resultatSuivi],
        ["Commentaires", e.commentairesSuivi],
      ]],
    ];
    const indexEnCours = definitions.findIndex((d) => !d[1]);
    this.etapes = definitions.map(([libelle, faite, date, champs], i) => ({
      libelle,
      faite: !!faite,
      enCours: i === indexEnCours,
      date: faite ? date : null,
      champs: champs
        .filter(([, v]) => v != null && String(v).trim() !== "")
        .map(([l, v]) => ({ libelle: l, valeur: String(v) })),
    }));
    this.etapesFaites = this.etapes.filter((x) => x.faite).length;

    this.position = lirePoint(e.pointGeometriques);
  }

  // ── Carte (Leaflet, fond OpenStreetMap) ──────────────────
  private afficherCarte(): void {
    if (!this.position || !this.conteneurCarte || this.carte) return;
    this.carte = L.map(this.conteneurCarte.nativeElement, {
      center: this.position,
      zoom: 16,
      scrollWheelZoom: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(this.carte);
    L.circleMarker(this.position, {
      radius: 9,
      color: "#ffffff",
      weight: 2,
      fillColor: "#d45c00",
      fillOpacity: 1,
    }).addTo(this.carte);
  }

  private detruireCarte(): void {
    this.carte?.remove();
    this.carte = null;
  }
}
