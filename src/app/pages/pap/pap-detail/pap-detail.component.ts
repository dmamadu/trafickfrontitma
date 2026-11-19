import { isExtensionAccepted } from "src/app/shared/utils/file-extension";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import * as XLSX from "xlsx";

import { CommonModule, registerLocaleData } from "@angular/common";
import localeFr from "@angular/common/locales/fr";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { LocalService } from "src/app/core/services/local.service";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { DatatableComponent } from "src/app/shared/datatable/datatable.component";
import {
  ButtonAction,
  TableauComponent,
} from "src/app/shared/tableau/tableau.component";
import { environment } from "src/environments/environment";
import { ClientVueService } from "../../admin/client-vue/client-vue.service";
import { CompensationDetailComponent } from "../../entente-compensation/compensation-detail/compensation-detail.component";
import { AddPlainteComponent } from "../../plainte/add-plainte/add-plainte.component";
import { PlainteDetailComponent } from "../../plainte/palainte-detail/plainte-detail.component";
import { InfoClientComponent } from "../info-client/info-client.component";
import { CategoriePap, PapService } from "../pap.service";
import { SignatureClientComponent } from "../signature-client/signature-client.component";

registerLocaleData(localeFr, "fr");

type Onglet ="profil" | "pertes" | "plaintes" | "ententes";

/** Libellés des catégories de PAP (champ `type` renvoyé par l'API). */
/** Libellés des statuts d'indemnisation (valeurs lues par le tableau de bord Baseline). */
const STATUTS: Record<string, string> = {
  recense: "Recensé",
  en_etude: "En étude",
  indemnisation_engagee: "Indemnisation engagée",
  indemnisation_terminee: "Indemnisation terminée",
  en_contentieux: "En contentieux",
};

const CATEGORIES: Record<string, string> = {
  PAPHABITAT: "Habitat",
  PAPAGRICOLE: "Agricole",
  PAPPLACEAFFAIRE: "Place d'affaires",
  PAPECONOMIQUE: "Opérateur économique",
};

@Component({
  selector: "app-pap-detail",
  templateUrl: "./pap-detail.component.html",
  standalone: true,
  imports: [
    AngularMaterialModule,
    InfoClientComponent,
    TableauComponent,
    DatatableComponent,
    CommonModule,
  ],
  styleUrl: "./pap-detail.component.css",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PapDetailComponent implements OnInit {
  onglet: Onglet = "profil";
  infosPap: any;
  categoriePap: CategoriePap | null = null;
  /** Rechargement de la PAP depuis le serveur (lien direct ou actualisation). */
  chargement = false;

  /** Photo */
  imagePath = "";
  loaderImg = false;
  urlImage = environment.apiUrl + "image/getFile/";

  /** Actions en cours (dédommagement) */
  loader = false;

  /** Plaintes de la PAP */
  plaintes: any[] = [];
  totalPlaintes = 0;
  plaintesChargees = false;
  headersPlainte = this.createHeaderPlainte();
  actionsPlainte: ButtonAction[] = this.createActionsPlainte();
  pageSizeOptions = [5, 10, 25, 100];
  pageSize = 10;
  pageIndex = 0;

  /** Entente de compensation (une par PAP) */
  ententes: any[] = [];
  ententesChargees = false;

  /** Aperçu d'un import Excel de plaintes */
  headings: any[] = [];
  dataExcel: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private snackbar: SnackBarService,
    private clientServive: ClientVueService,
    private _matDialog: MatDialog,
    private papService: PapService,
    private localService: LocalService,
    public toastr: ToastrService
  ) {}

  /**
   * La fiche s'ouvre avec ?categorie=habitat&id=12 : la PAP est relue sur le serveur
   * (lien partageable, actualisation de la page). Sans paramètres, on garde l'ancienne
   * PAP mémorisée dans le navigateur, puis on la rafraîchit si on connaît sa catégorie.
   */
  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    const categorie = q.get("categorie") as CategoriePap | null;
    const id = q.get("id");

    this.infosPap = this.localService.getDataJson("pap");
    const memoriseeCorrespond =
      this.infosPap && (!id || String(this.infosPap.id) === id);
    if (!memoriseeCorrespond) this.infosPap = null;

    this.categoriePap = categorie || PapService.categorieDe(this.infosPap);
    this.majPhoto();
    this.chargerListesLiees();

    const idPap = id || this.infosPap?.id;
    if (this.categoriePap && idPap) {
      this.rechargerPap(this.categoriePap, idPap);
    }
  }

  private chargerListesLiees(): void {
    if (this.infosPap?.codePap) {
      this.getPlainteByCodePap();
      this.getEntenteByCodePap();
    }
  }

  private rechargerPap(categorie: CategoriePap, id: number | string): void {
    const codeAvant = this.infosPap?.codePap;
    this.chargement = !this.infosPap;
    this.papService
      .getFichePap(categorie, id, this.localService.getData("ProjectId"))
      .subscribe({
        next: (resp: any) => {
          this.chargement = false;
          const pap = resp?.data?.[0];
          if (pap) {
            this.appliquerPap(pap);
            if (pap.codePap !== codeAvant) this.chargerListesLiees();
          }
          this._changeDetectorRef.markForCheck();
        },
        error: () => {
          // PAP absente de ce projet : on garde la version mémorisée s'il y en a une.
          this.chargement = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  /** Remplace la PAP affichée (nouvel objet : les onglets se reconstruisent). */
  private appliquerPap(pap: any): void {
    this.infosPap = { ...pap };
    this.categoriePap = PapService.categorieDe(pap) || this.categoriePap;
    this.localService.saveDataJson("pap", this.infosPap);
    this.majPhoto();
  }

  // ---------------------------------------------------------------------------
  // Données d'en-tête
  // ---------------------------------------------------------------------------

  get nomComplet(): string {
    const nom = [this.infosPap?.prenom, this.infosPap?.nom]
      .filter((v) => !!v)
      .join(" ");
    return nom || this.infosPap?.codePap || "PAP";
  }

  get initiales(): string {
    const p = (this.infosPap?.prenom || "").trim().charAt(0);
    const n = (this.infosPap?.nom || "").trim().charAt(0);
    return (p + n).toUpperCase() || "?";
  }

  get categorie(): string {
    return CATEGORIES[this.infosPap?.type] || "";
  }

  /** Les imports renseignent `vulnerabilite` en texte libre : « Non », « 0 »… = non vulnérable. */
  get estVulnerable(): boolean {
    const v = String(this.infosPap?.vulnerabilite ?? "").trim().toLowerCase();
    return !!v && !["non", "0", "false", "aucune", "non vulnérable", "non vulnerable"].includes(v);
  }

  get libelleStatut(): string {
    const s = this.infosPap?.statutPap;
    return STATUTS[s] || s || "";
  }

  get estDedommagee(): boolean {
    return this.infosPap?.statutPap === "indemnisation_terminee";
  }

  get numeroIdentification(): string {
    return this.infosPap?.numeroPni || this.infosPap?.numeroIdentification || "";
  }

  /** Plaintes sans date de clôture. */
  get plaintesOuvertes(): number {
    return this.plaintes.filter((p) => !p?.dateCloture).length;
  }

  // ---------------------------------------------------------------------------
  // Onglets
  // ---------------------------------------------------------------------------

  choisirOnglet(onglet: Onglet): void {
    this.onglet = onglet;
  }

  // ---------------------------------------------------------------------------
  // Chargement
  // ---------------------------------------------------------------------------

  /** photoPap : URL complète (import) ou nom de fichier envoyé depuis la fiche. */
  private majPhoto(): void {
    const photo: string = this.infosPap?.photoPap || this.infosPap?.imagePath || "";
    if (/^https?:\/\//.test(photo)) {
      this.imagePath = photo;
    } else if (/^[A-Za-z0-9._-]+\.(png|jpe?g)$/i.test(photo)) {
      this.imagePath = this.urlImage + photo;
    } else {
      this.imagePath = "";
    }
  }

  getPlainteByCodePap() {
    return this.papService
      .getByCodePap(
        "plaintes",
        this.infosPap.codePap,
        this.pageIndex,
        this.pageSize,
        this.localService.getData("ProjectId")
      )
      .subscribe({
        next: (data: any) => {
          this.plaintesChargees = true;
          if (data?.responseCode == 200) {
            this.plaintes = data.data || [];
            this.totalPlaintes = data.length ?? this.plaintes.length;
          } else {
            this.plaintes = [];
            this.totalPlaintes = 0;
          }
          this._changeDetectorRef.markForCheck();
        },
        error: () => {
          this.plaintesChargees = true;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  /** L'API renvoie 404 quand la PAP n'a pas encore d'entente : ce n'est pas une erreur. */
  getEntenteByCodePap() {
    return this.papService
      .getPlaintEntenteByCodePap(
        "ententes",
        this.infosPap.codePap,
        this.localService.getData("ProjectId")
      )
      .subscribe({
        next: (data: any) => {
          this.ententesChargees = true;
          this.ententes =
            data?.responseCode == 200 ? (data.data || []).filter((e) => !!e) : [];
          this._changeDetectorRef.markForCheck();
        },
        error: () => {
          this.ententesChargees = true;
          this.ententes = [];
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  pageChanged(event) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.getPlainteByCodePap();
  }

  // ---------------------------------------------------------------------------
  // Actions de l'en-tête
  // ---------------------------------------------------------------------------

  dedommager(): void {
    if (!this.categoriePap || !this.infosPap?.id) {
      this.snackbar.openSnackBar(
        "Catégorie de la PAP inconnue : rouvrez la fiche depuis la liste des PAP.",
        "OK",
        ["mycssSnackbarRed"]
      );
      return;
    }
    this.snackbar
      .showConfirmation("Voulez-vous vraiment marquer cette PAP comme dédommagée ?")
      .then((result) => {
        if (result["value"] != true) return;
        this.loader = true;
        this._changeDetectorRef.markForCheck();
        this.papService
          .dedommagerPap(this.categoriePap, this.infosPap.id, this.localService.getData("ProjectId"))
          .subscribe({
            next: (resp: any) => {
              this.loader = false;
              if (resp?.data?.[0]) this.appliquerPap(resp.data[0]);
              this.snackbar.openSnackBar(resp?.message || "PAP dédommagée", "OK", [
                "mycssSnackbarGreen",
              ]);
              this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
              this.loader = false;
              this.snackbar.showErrors(error);
              this._changeDetectorRef.markForCheck();
            },
          });
      });
  }

  signatureClient(): void {
    this._matDialog.open(SignatureClientComponent, {
      autoFocus: true,
      width: "35rem",
      panelClass: "event-form-dialog",
      disableClose: true,
      data: {
        action: "new",
        pap: this.infosPap,
      },
    });
  }

  selectOnFile(evt) {
    const accept = [".png", ".PNG", ".jpg", ".JPG", ".jpeg", ".JPEG"];
    const file = evt.target.files?.[0];
    if (!file) return;
    const ext = file.name.substring(file.name.lastIndexOf("."));
    if (!isExtensionAccepted(accept, ext)) {
      this.snackbar.openSnackBar(
        "Ce fichier " + file.name + " n'est pas une image",
        "OK",
        ["mycssSnackbarRed"]
      );
      return;
    }
    this.saveStoreFile(file);
    evt.target.value = "";
  }

  saveStoreFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    this.loaderImg = true;
    this._changeDetectorRef.markForCheck();
    this.clientServive.saveStoreFile(formData).subscribe(
      (resp) => {
        if (resp) {
          this.saveFile(resp["fileName"]);
        }
      },
      (error) => {
        this.loaderImg = false;
        this.snackbar.showErrors(error);
        this._changeDetectorRef.markForCheck();
      }
    );
  }

  saveFile(nomFichier: string) {
    if (!this.categoriePap || !this.infosPap?.id) {
      this.loaderImg = false;
      this.snackbar.openSnackBar(
        "Catégorie de la PAP inconnue : rouvrez la fiche depuis la liste des PAP.",
        "OK",
        ["mycssSnackbarRed"]
      );
      this._changeDetectorRef.markForCheck();
      return;
    }
    this.papService
      .changerPhotoPap(this.categoriePap, this.infosPap.id, this.localService.getData("ProjectId"), nomFichier)
      .subscribe({
        next: (resp: any) => {
          this.loaderImg = false;
          if (resp?.data?.[0]) this.appliquerPap(resp.data[0]);
          this.snackbar.openSnackBar("Photo enregistrée", "OK", ["mycssSnackbarGreen"]);
          this._changeDetectorRef.markForCheck();
        },
        error: (error) => {
          this.loaderImg = false;
          this.snackbar.showErrors(error);
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  // ---------------------------------------------------------------------------
  // Plaintes
  // ---------------------------------------------------------------------------

  createHeaderPlainte() {
    return [
      { th: "N° plainte", td: "numeroReference" },
      { th: "Date d'enregistrement", td: "dateEnregistrement" },
      { th: "Objet", td: "objetPlainte" },
      { th: "Prochaine étape", td: "prochaineEtape" },
      { th: "Statut", td: "statut" },
    ];
  }

  createActionsPlainte(): ButtonAction[] {
    return [
      {
        icon: "bxs-info-circle",
        couleur: "#245363",
        size: "icon-size-4",
        title: "Détail",
        isDisabled: false,
        action: (element?) => this.detailItemsPlainte(element),
      },
    ];
  }

  detailItemsPlainte(element: any) {
    this.snackbar.openModal(
      PlainteDetailComponent,
      "auto",
      "edit",
      "",
      element,
      "",
      () => this.getPlainteByCodePap()
    );
  }

  addItems(): void {
    this.snackbar.openModal(
      AddPlainteComponent,
      "55rem",
      "new",
      "",
      this.plaintes,
      "",
      () => this.getPlainteByCodePap()
    );
  }

  triggerFileUpload() {
    const input = document.getElementById("pap-plainte-upload") as HTMLInputElement;
    input?.click();
  }

  fileUpload(event: any) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFile);
    fileReader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      workbook.SheetNames.forEach((sheet) => {
        const data: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
          header: 1,
        }) as any[][];
        const headers = data[0] || [];
        this.headings = headers;
        this.dataExcel = data.slice(1).map((row: any[]) => {
          const obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index];
          });
          return obj;
        });
      });
      this._changeDetectorRef.markForCheck();
    };
    event.target.value = "";
  }

  resetDataFromExcel() {
    this.headings = [];
    this.dataExcel = [];
  }

  importData() {
    const lignes = this.dataExcel.map((item: any) => ({
      ...item,
      codePap: this.infosPap.codePap,
    }));
    this.papService
      .add(
        "plaintes/importer?projectId=" + this.localService.getData("ProjectId"),
        lignes
      )
      .subscribe(
        (response: any) => {
          if (response.responseCode === 201) {
            this.toastr.success(response.message);
            this.getPlainteByCodePap();
          } else if (response.responseCode === 400) {
            this.toastr.error(response.message);
          }
        },
        () => {
          this.toastr.error("Une erreur est survenue pendant l'import.");
        }
      );
    this.resetDataFromExcel();
  }

  // ---------------------------------------------------------------------------
  // Ententes
  // ---------------------------------------------------------------------------

  detailItemsEntente(element: any) {
    this.snackbar.openModal(
      CompensationDetailComponent,
      "",
      "edit",
      "",
      element,
      "",
      () => this.getEntenteByCodePap()
    );
  }
}
