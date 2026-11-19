import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule, registerLocaleData } from "@angular/common";
import localeFr from "@angular/common/locales/fr";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { NgApexchartsModule } from "ng-apexcharts";
import { Subject, takeUntil } from "rxjs";
import { LocalService } from "src/app/core/services/local.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { ProjectService } from "src/app/core/services/project.service";
import { UIModule } from "src/app/shared/ui/ui.module";
import { BaselineMapComponent, PointPap, STATUTS_PAP } from "../baseline-map/baseline-map.component";

registerLocaleData(localeFr, "fr");

interface CriterionStats { total: number; hommes: number; femmes: number; autre: number; }

interface CategoryStats {
  total: number;
  hommes: number;
  femmes: number;
  autre: number;
  totalVulnerables: number;
  vulnerablesHommes: number;
  vulnerablesFemmes: number;
  vulnerablesAutre: number;
  criteresVulnerabilite: { [key: string]: CriterionStats };
  totalPerte: number;
}

interface BaselineStats {
  dateMaj: string;
  statutProjet: string | null;
  zones: string[];
  nbZones: number;
  placeAffaire: CategoryStats;
  agricole: CategoryStats;
  habitat: CategoryStats;
  total: CategoryStats;
  avancement: { recense: number; enEtude: number; terminee: number; inconnu: number };
  points: PointPap[];
}

interface Tache { id: number; libelle: string; description?: string; dateDebut: string; dateFin: string; statut: string; }
interface Rencontre { id: number; date: string; libelle: string; }

const TACHE_STATUTS: Record<string, { label: string; classe: string }> = {
  "en-attente": { label: "En attente", classe: "is-attente" },
  "en-cours": { label: "En cours", classe: "is-cours" },
  "approuve": { label: "Approuvé", classe: "is-approuve" },
  "complete": { label: "Complété", classe: "is-complete" },
};

@Component({
  selector: "app-jobs",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, NgApexchartsModule, UIModule, BaselineMapComponent],
  templateUrl: "./jobs.component.html",
  styleUrls: ["./jobs.component.scss"],
})
export class JobsComponent implements OnInit, OnDestroy {
  readonly categories = [
    { key: "placeAffaire", label: "Place affaire / Économique", court: "Places affaires" },
    { key: "agricole", label: "Agricole / Exploitant", court: "Agricoles" },
    { key: "habitat", label: "Habitat", court: "Habitat" },
  ] as const;

  /** Clés produites par StatsHelper (backend) → libellés courts des colonnes. */
  readonly criteres = [
    { key: "Situation matrimoniale précaire", label: "Situation matrimoniale" },
    { key: "Ménage avec personne handicapée", label: "Personne handicapée" },
    { key: "Mineur chef de ménage", label: "Mineur(e) en charge" },
    { key: "Personne âgée sans soutien", label: "Personne âgée" },
    { key: "Ménage nombreux", label: "Ménage nombreux" },
    { key: "Analphabétisme", label: "Analphabète" },
    { key: "Vulnérabilité déclarée", label: "Déclarée (sans détail)" },
  ];

  readonly statutsPap = STATUTS_PAP;
  readonly jours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  private destroy$ = new Subject<void>();
  private reload$ = new Subject<void>();
  private projectId: number;

  loading = true;
  erreur = false;
  stats: BaselineStats | null = null;

  zone = "";
  categorie = "";
  vue: "tableau" | "graphique" = "tableau";
  categorieCarte = "";

  rencontres: Rencontre[] = [];
  rencontresChargees = false;

  taches: Tache[] = [];
  tachesErreur = false;
  semaine: Date[] = [];
  jourSelectionne: Date | null = null;

  chart: any = null;

  constructor(
    private localService: LocalService,
    private parentService: ServiceParent,
    private projectService: ProjectService,
  ) {
    this.projectId = Number(this.localService.getData("ProjectId"));
    this.semaine = this.calculerSemaine(new Date());
  }

  ngOnInit(): void {
    this.charger();
    this.chargerRencontres();
    this.chargerTaches();
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
    this.categorieCarte = this.categorie;
    this.projectService
      .getBaselineStats(this.projectId, { zone: this.zone, categorie: this.categorie })
      .pipe(takeUntil(this.reload$), takeUntil(this.destroy$))
      .subscribe({
        next: (s: BaselineStats) => {
          this.stats = s;
          this.chart = this.construireGraphique(s);
          this.loading = false;
        },
        error: (err) => {
          console.error("Erreur chargement tableau de bord Baseline :", err);
          this.erreur = true;
          this.loading = false;
        },
      });
  }

  private chargerRencontres(): void {
    this.projectService
      .getRencontreByProjectId(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.rencontres = data?.responseCode === 200 ? data.data ?? [] : [];
          this.rencontresChargees = true;
        },
        error: (err) => {
          console.error("Erreur rencontres :", err);
          this.rencontresChargees = true;
        },
      });
  }

  private chargerTaches(): void {
    this.parentService
      .list("taches", 10000, 0, this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.taches = data?.responseCode === 200 ? data.data ?? [] : [];
        },
        error: (err) => {
          console.error("Erreur tâches :", err);
          this.tachesErreur = true;
        },
      });
  }

  // ─────────────── Indicateurs ───────────────

  pct(part: number, total: number): number {
    return total > 0 ? (part * 100) / total : 0;
  }

  stat(key: string): CategoryStats | null {
    return (this.stats as any)?.[key] ?? null;
  }

  get categoriesVisibles() {
    return this.categories.filter((c) => !this.categorie || c.key === this.categorie);
  }

  get nbCategories(): number {
    return this.categories.filter((c) => (this.stat(c.key)?.total ?? 0) > 0).length;
  }

  get prochaineRencontre(): Rencontre | null {
    const maintenant = new Date();
    maintenant.setHours(0, 0, 0, 0);
    return (
      this.rencontres
        .filter((r) => r.date && new Date(r.date) >= maintenant)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null
    );
  }

  get pctIndemnisees(): number {
    const a = this.stats?.avancement;
    return a ? this.pct(a.terminee, this.totalAvancement) : 0;
  }

  get totalAvancement(): number {
    const a = this.stats?.avancement;
    return a ? a.recense + a.enEtude + a.terminee + a.inconnu : 0;
  }

  avancementValeur(key: string): number {
    const a = this.stats?.avancement;
    if (!a) return 0;
    return ({ recense: a.recense, en_etude: a.enEtude, terminee: a.terminee, inconnu: a.inconnu } as any)[key] ?? 0;
  }

  // ─────────────── Vulnérabilités ───────────────

  get criteresVisibles() {
    // « Déclarée (sans détail) » n'apparaît que si au moins une PAP est dans ce cas.
    return this.criteres.filter((c) => c.key !== "Vulnérabilité déclarée" || this.valeurCritere(null, c.key) > 0);
  }

  valeurCritere(categorie: string | null, critere: string): number {
    const s = categorie ? this.stat(categorie) : this.stats?.total;
    return s?.criteresVulnerabilite?.[critere]?.total ?? 0;
  }

  get maxCritere(): number {
    let max = 0;
    for (const c of this.categoriesVisibles) for (const k of this.criteres) max = Math.max(max, this.valeurCritere(c.key, k.key));
    return max;
  }

  /** Niveau 0 (aucune PAP) à 5 (maximum du tableau). */
  niveau(v: number): number {
    const max = this.maxCritere;
    return v <= 0 || max <= 0 ? 0 : Math.max(1, Math.ceil((v / max) * 5));
  }

  // ─────────────── Carte ───────────────

  get pointsCarte(): PointPap[] {
    const pts = this.stats?.points ?? [];
    return this.categorieCarte ? pts.filter((p) => p.categorie === this.categorieCarte) : pts;
  }

  // ─────────────── Tâches ───────────────

  private calculerSemaine(ref: Date): Date[] {
    const lundi = new Date(ref);
    lundi.setHours(0, 0, 0, 0);
    lundi.setDate(lundi.getDate() - ((lundi.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lundi);
      d.setDate(lundi.getDate() + i);
      return d;
    });
  }

  private debutJour(d: string | Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  /** La tâche couvre-t-elle ce jour (dateDebut ≤ jour ≤ dateFin) ? */
  private couvre(t: Tache, jour: Date): boolean {
    if (!t.dateDebut) return false;
    const debut = this.debutJour(t.dateDebut);
    const fin = this.debutJour(t.dateFin || t.dateDebut);
    return debut <= jour && jour <= fin;
  }

  get tachesSemaine(): Tache[] {
    return this.taches
      .filter((t) => this.semaine.some((j) => this.couvre(t, j)))
      .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());
  }

  get tachesAffichees(): Tache[] {
    const liste = this.jourSelectionne ? this.tachesSemaine.filter((t) => this.couvre(t, this.jourSelectionne!)) : this.tachesSemaine;
    return liste.slice(0, 5);
  }

  compterTaches(statut: string): number {
    return this.tachesSemaine.filter((t) => t.statut === statut).length;
  }

  aDesTaches(jour: Date): boolean {
    return this.taches.some((t) => this.couvre(t, jour));
  }

  estAujourdhui(jour: Date): boolean {
    return jour.getTime() === this.debutJour(new Date()).getTime();
  }

  basculerJour(jour: Date): void {
    this.jourSelectionne = this.jourSelectionne?.getTime() === jour.getTime() ? null : jour;
  }

  /** Jour affiché à gauche de la tâche : début de la tâche, ramené au lundi si elle a commencé avant. */
  jourTache(t: Tache): Date {
    const debut = this.debutJour(t.dateDebut);
    return debut < this.semaine[0] ? this.semaine[0] : debut;
  }

  statutTache(s: string) {
    return TACHE_STATUTS[s] ?? { label: s || "Sans statut", classe: "" };
  }

  // ─────────────── Graphique ───────────────

  private construireGraphique(s: BaselineStats): any {
    const cats = this.categoriesVisibles;
    const v = (k: string, f: keyof CategoryStats) => ((s as any)[k]?.[f] as number) ?? 0;
    return {
      series: [
        { name: "Hommes", data: cats.map((c) => v(c.key, "hommes")) },
        { name: "Femmes", data: cats.map((c) => v(c.key, "femmes")) },
        { name: "Non renseigné", data: cats.map((c) => v(c.key, "autre")) },
      ],
      chart: { type: "bar", height: 260, stacked: true, toolbar: { show: false }, fontFamily: "inherit" },
      plotOptions: { bar: { horizontal: true, barHeight: "55%", borderRadius: 3 } },
      colors: ["#245363", "#d45c00", "#b8b2aa"],
      dataLabels: { enabled: true, style: { fontSize: "11px" } },
      xaxis: { categories: cats.map((c) => c.label) },
      legend: { position: "bottom" },
      grid: { borderColor: "#ece9e4" },
    };
  }

  // ─────────────── Export ───────────────

  exporter(): void {
    const s = this.stats;
    if (!s) return;
    const catLabel = this.categories.find((c) => c.key === this.categorie)?.label ?? "Toutes les catégories";
    const lignes: (string | number)[][] = [
      ["Tableau de bord — BaseLine PAR"],
      ["Zone", this.zone || "Toutes les zones"],
      ["Catégorie", catLabel],
      ["Mis à jour le", new Date(s.dateMaj).toLocaleString("fr-FR")],
      [],
      ["Catégorie", "Total", "Hommes", "Femmes", "N.R.", "Vuln. H", "Vuln. F", "Total vuln."],
      ...this.categoriesVisibles.map((c) => {
        const x = this.stat(c.key)!;
        return [c.label, x.total, x.hommes, x.femmes, x.autre, x.vulnerablesHommes, x.vulnerablesFemmes, x.totalVulnerables];
      }),
      ["Total général", s.total.total, s.total.hommes, s.total.femmes, s.total.autre, s.total.vulnerablesHommes, s.total.vulnerablesFemmes, s.total.totalVulnerables],
      [],
      ["Avancement des indemnisations", "PAP", "%"],
      ...STATUTS_PAP.map((st) => [st.label, this.avancementValeur(st.key), this.pct(this.avancementValeur(st.key), this.totalAvancement).toFixed(1)]),
      [],
      ["Vulnérabilités par critère", ...this.criteresVisibles.map((c) => c.label)],
      ...this.categoriesVisibles.map((c) => [c.label, ...this.criteresVisibles.map((k) => this.valeurCritere(c.key, k.key))]),
      [],
      ["Consultations", this.rencontres.length],
    ];
    const csv = lignes.map((l) => l.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `baseline-par-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
