import { Component, OnDestroy, OnInit } from "@angular/core";
import { registerLocaleData } from "@angular/common";
import localeFr from "@angular/common/locales/fr";
import { Subject, takeUntil } from "rxjs";
import { LocalService } from "src/app/core/services/local.service";
import { ProjectService } from "src/app/core/services/project.service";

interface Etape { code: string; libelle: string; count: number; }
interface Categorie { code: string; libelle: string; totalPap: number; dossiers: number; papPayees: number; budget: number; verse: number; }

interface MiseEnOeuvreStats {
  dateMaj: string;
  zones: string[];
  totalPap: number;
  totalVulnerables: number;
  totalDossiers: number;
  vulnerablesDossiers: number;
  budgetPrevu: number;
  montantVerse: number;
  resteAPayer: number;
  tauxDecaissement: number;
  dossiersTransmis: number;
  ententesFinalisees: number;
  papPayees: number;
  vulnerablesPayees: number;
  etapes: Etape[];
  statuts: { brouillon: number; synchronisee: number; finalisee: number };
  categories: Categorie[];
  alertes: { accordsEnRetard: number; vulnerablesNonPayees: number; ententesAValider: number };
}

interface DossierEtape {
  ententeId: number;
  codePap: string;
  prenom: string;
  nom: string;
  categorie: string;
  vulnerable: boolean;
  zone: string;
  montant: number;
  joursEtape: number | null;
}

type Periode = "tout" | "30j" | "90j" | "annee";

// Formats français (espaces de milliers, virgule décimale) pour les pipes number:'…':'fr'.
registerLocaleData(localeFr, "fr");

@Component({
  selector: "app-mise-en-oeuvre",
  templateUrl: "./mise-en-oeuvre.component.html",
  styleUrl: "./mise-en-oeuvre.component.css",
})
export class MiseEnOeuvreComponent implements OnInit, OnDestroy {
  /** Monnaie locale du PAR (pas encore de champ devise sur le projet). */
  readonly devise = "FCFA";
  readonly seuilRetardJours = 30;
  readonly libellesCategorie: Record<string, string> = {
    placeAffaire: "Place affaire",
    agricole: "Agricole",
    habitat: "Habitat",
  };
  readonly periodes: { value: Periode; label: string }[] = [
    { value: "tout", label: "Depuis le début" },
    { value: "30j", label: "30 derniers jours" },
    { value: "90j", label: "90 derniers jours" },
    { value: "annee", label: "Cette année" },
  ];

  private destroy$ = new Subject<void>();
  private reload$ = new Subject<void>();
  private projectId: number;

  loading = true;
  erreur = false;
  stats: MiseEnOeuvreStats | null = null;

  zone = "";
  periode: Periode = "tout";

  etapeSelectionnee: Etape | null = null;
  goulot: Etape | null = null;
  maxEtape = 0;

  dossiers: DossierEtape[] = [];
  dossiersTotal = 0;
  dossiersPage = 0;
  dossiersTaille = 5;
  dossiersLoading = false;

  constructor(private localService: LocalService, private projectService: ProjectService) {
    this.projectId = Number(this.localService.getData("ProjectId"));
  }

  ngOnInit(): void {
    this.charger();
  }

  ngOnDestroy(): void {
    this.reload$.next();
    this.reload$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────────── Chargement ───────────────

  charger(): void {
    this.reload$.next();
    this.erreur = false;
    if (!this.stats) this.loading = true;

    this.projectService
      .getMiseEnOeuvreStats(this.projectId, { zone: this.zone, ...this.bornesPeriode() })
      .pipe(takeUntil(this.reload$), takeUntil(this.destroy$))
      .subscribe({
        next: (stats: MiseEnOeuvreStats) => {
          this.stats = stats;
          this.calculerEtapes(stats.etapes);
          this.loading = false;
        },
        error: (err) => {
          console.error("Erreur chargement tableau de bord M/O :", err);
          this.erreur = true;
          this.loading = false;
        },
      });
  }

  private calculerEtapes(etapes: Etape[]): void {
    this.maxEtape = Math.max(0, ...etapes.map((e) => e.count));
    // Goulot = étape en cours (hors « Processus terminé ») qui retient le plus de dossiers.
    const enCours = etapes.filter((e) => e.code !== "PROCESSUS_TERMINE" && e.count > 0);
    this.goulot = enCours.length ? enCours.reduce((a, b) => (b.count > a.count ? b : a)) : null;

    const precedente = this.etapeSelectionnee?.code;
    const cible = etapes.find((e) => e.code === precedente) ?? this.goulot ?? etapes[0] ?? null;
    this.selectionnerEtape(cible);
  }

  selectionnerEtape(etape: Etape | null): void {
    this.etapeSelectionnee = etape;
    this.dossiersPage = 0;
    this.chargerDossiers();
  }

  chargerDossiers(): void {
    const etape = this.etapeSelectionnee;
    if (!etape || etape.count === 0) {
      this.dossiers = [];
      this.dossiersTotal = 0;
      return;
    }
    this.dossiersLoading = true;
    this.projectService
      .getDossiersEtape(this.projectId, etape.code, this.zone, this.dossiersPage, this.dossiersTaille)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          this.dossiers = page?.content ?? [];
          this.dossiersTotal = page?.totalElements ?? 0;
          this.dossiersLoading = false;
        },
        error: (err) => {
          console.error("Erreur chargement des dossiers :", err);
          this.dossiers = [];
          this.dossiersLoading = false;
        },
      });
  }

  voirTousLesDossiers(): void {
    this.dossiersTaille = this.dossiersTaille === 5 ? 20 : 5;
    this.dossiersPage = 0;
    this.chargerDossiers();
  }

  pageDossiers(delta: number): void {
    const next = this.dossiersPage + delta;
    if (next < 0 || next * this.dossiersTaille >= this.dossiersTotal) return;
    this.dossiersPage = next;
    this.chargerDossiers();
  }

  get dossiersPages(): number {
    return Math.max(1, Math.ceil(this.dossiersTotal / this.dossiersTaille));
  }

  voirAccordsEnRetard(): void {
    const accord = this.stats?.etapes.find((e) => e.code === "ACCORD_A_OBTENIR") ?? null;
    this.selectionnerEtape(accord);
    document.getElementById("meo-processus")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ─────────────── Filtres ───────────────

  private bornesPeriode(): { debut?: string; fin?: string } {
    const today = new Date();
    const iso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    switch (this.periode) {
      case "30j": return { debut: iso(new Date(today.getTime() - 30 * 86400000)) };
      case "90j": return { debut: iso(new Date(today.getTime() - 90 * 86400000)) };
      case "annee": return { debut: `${today.getFullYear()}-01-01` };
      default: return {};
    }
  }

  get filtrePeriodeActif(): boolean {
    return this.periode !== "tout";
  }

  // ─────────────── Affichage ───────────────

  pct(part: number, total: number): number {
    return total > 0 ? (part * 100) / total : 0;
  }

  hauteurEtape(e: Etape): number {
    return this.maxEtape > 0 ? Math.max(4, (e.count * 100) / this.maxEtape) : 0;
  }

  /** 912 400 000 → « 912,4 M » ; 2 450 000 000 → « 2,45 Md ». */
  montantCourt(v: number | null | undefined): string {
    const n = v ?? 0;
    const fr = (x: number, d: number) => x.toLocaleString("fr-FR", { maximumFractionDigits: d });
    if (Math.abs(n) >= 1e9) return `${fr(n / 1e9, 2)} Md`;
    if (Math.abs(n) >= 1e6) return `${fr(n / 1e6, 1)} M`;
    return fr(n, 0);
  }

  nomPap(d: DossierEtape): string {
    const initiale = d.prenom ? `${d.prenom.trim().charAt(0)}. ` : "";
    return d.nom ? `${initiale}${d.nom}` : d.codePap ?? "—";
  }

  classeJours(j: number | null): string {
    if (j == null) return "";
    if (j > this.seuilRetardJours) return "jours--retard";
    if (j > 14) return "jours--alerte";
    return "";
  }

  statutsTotal(): number {
    const s = this.stats?.statuts;
    return s ? s.brouillon + s.synchronisee + s.finalisee : 0;
  }

  // ─────────────── Export ───────────────

  exporter(): void {
    const s = this.stats;
    if (!s) return;
    const periode = this.periodes.find((p) => p.value === this.periode)?.label ?? "";
    const lignes: (string | number)[][] = [
      ["Tableau de bord — Mise en œuvre du PAR"],
      ["Zone", this.zone || "Toutes les zones"],
      ["Période (paiements et finalisations)", periode],
      ["Mis à jour le", new Date(s.dateMaj).toLocaleString("fr-FR")],
      [],
      ["Indicateur", "Valeur", "Sur"],
      [`Compensations versées (${this.devise})`, Math.round(s.montantVerse), Math.round(s.budgetPrevu)],
      [`Reste à payer (${this.devise})`, Math.round(s.resteAPayer), ""],
      ["Taux de décaissement (%)", s.tauxDecaissement.toFixed(1), ""],
      ["Dossiers transmis", s.dossiersTransmis, s.totalDossiers],
      ["Ententes finalisées", s.ententesFinalisees, s.totalDossiers],
      ["PAP payées", s.papPayees, s.totalDossiers],
      ["PAP vulnérables payées", s.vulnerablesPayees, s.vulnerablesDossiers],
      [],
      ["Étape", "Dossiers"],
      ...s.etapes.map((e) => [e.libelle, e.count]),
      [],
      ["Catégorie", "PAP", "Dossiers", "PAP payées", `Budget (${this.devise})`, `Versé (${this.devise})`],
      ...s.categories.map((c) => [c.libelle, c.totalPap, c.dossiers, c.papPayees, Math.round(c.budget), Math.round(c.verse)]),
      [],
      ["Points d'attention", "Nombre"],
      [`Accords en attente depuis plus de ${this.seuilRetardJours} jours`, s.alertes.accordsEnRetard],
      ["PAP vulnérables pas encore payées", s.alertes.vulnerablesNonPayees],
      ["Ententes synchronisées à valider", s.alertes.ententesAValider],
    ];
    const csv = lignes
      .map((l) => l.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mise-en-oeuvre-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
