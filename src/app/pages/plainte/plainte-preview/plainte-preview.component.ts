// import { CommonModule } from "@angular/common";
// import { Component, Input, OnChanges } from "@angular/core";

// interface ValidationError {
//   type: string;
//   message: string;
//   rows?: number[];
// }

// const CHAMPS_OBLIGATOIRES: { key: string; label: string }[] = [
//   { key: "numeroReference",   label: "Numéro de référence" },
//   { key: "nomPrenom",         label: "Nom & Prénom" },
//   { key: "dateEnregistrement",label: "Date d'enregistrement" },
//   { key: "categorisation",    label: "Catégorisation" },
//   { key: "objetPlainte",      label: "Objet de la plainte" },
//   { key: "niveauGravite",     label: "Niveau de gravité" },
//   { key: "descriptionPlainte",label: "Description de la plainte" },
// ];

// const COLONNES_APERCU = [
//   { key: "numeroReference",   label: "Référence"  },
//   { key: "nomPrenom",         label: "Plaignant"  },
//   { key: "codePap",           label: "Code PAP"   },
//   { key: "dateEnregistrement",label: "Date"       },
//   { key: "categorisation",    label: "Catégorie"  },
//   { key: "niveauGravite",     label: "Gravité"    },
//   { key: "statut",            label: "Statut"     },
// ];

// @Component({
//   selector: "app-plainte-preview",
//   templateUrl: "./plainte-preview.component.html",
//   standalone: true,
//   imports: [CommonModule],
// })
// export class PlaintePreviewComponent implements OnChanges {
//   @Input() dataExcel: any[] = [];

//   colonnes = COLONNES_APERCU;
//   validationErrors: ValidationError[] = [];

//   ngOnChanges(): void {
//     this.valider();
//   }

//   private valider(): void {
//     this.validationErrors = [];
//     this.verifierChampsObligatoires();
//     this.verifierDoublons();
//   }

//   private verifierChampsObligatoires(): void {
//     CHAMPS_OBLIGATOIRES.forEach(({ key, label }) => {
//       const lignesVides = this.dataExcel
//         .map((row, i) =>
//           row[key] === undefined || row[key] === null || row[key] === "" ? i + 2 : null
//         )
//         .filter((i): i is number => i !== null);

//       if (lignesVides.length > 0) {
//         this.validationErrors.push({
//           type: "EMPTY_VALUES",
//           message: `"${label}" contient des valeurs manquantes`,
//           rows: lignesVides,
//         });
//       }
//     });
//   }

//   private verifierDoublons(): void {
//     const compteur: Record<string, number[]> = {};
//     this.dataExcel.forEach((row, i) => {
//       const ref = row["numeroReference"];
//       if (ref) {
//         if (!compteur[ref]) compteur[ref] = [];
//         compteur[ref].push(i + 2);
//       }
//     });

//     Object.entries(compteur).forEach(([ref, lignes]) => {
//       if (lignes.length > 1) {
//         this.validationErrors.push({
//           type: "DUPLICATE",
//           message: `Référence "${ref}" en doublon`,
//           rows: lignes,
//         });
//       }
//     });
//   }

//   hasErrors(): boolean {
//     return this.validationErrors.length > 0;
//   }

//   badgeStatut(statut: string): string {
//     if (statut === "FERMEE")   return "badge bg-success";
//     if (statut === "EN COURS") return "badge bg-warning text-dark";
//     if (statut === "OUVERTE")  return "badge bg-primary";
//     return "badge bg-secondary";
//   }

//   badgeGravite(gravite: string): string {
//     if (["Elevé", "ELEVE", "Eléve"].includes(gravite)) return "badge bg-danger";
//     if (gravite === "Moyen")  return "badge bg-warning text-dark";
//     if (gravite === "Faible") return "badge bg-success";
//     return "badge bg-secondary";
//   }

//   isGravite(key: string): boolean { return key === "niveauGravite"; }
//   isStatut(key:  string): boolean { return key === "statut"; }
// }
import { CommonModule } from "@angular/common";
import { Component, Input, OnChanges } from "@angular/core";

interface ValidationError {
  type: string;
  message: string;
  rows?: number[];
}

const CHAMPS_OBLIGATOIRES: { key: string; label: string }[] = [
  { key: "numeroReference",   label: "Numéro de référence" },
  { key: "nomPrenom",         label: "Nom & Prénom" },
  { key: "dateEnregistrement",label: "Date d'enregistrement" },
  { key: "categorisation",    label: "Catégorisation" },
  { key: "objetPlainte",      label: "Objet de la plainte" },
  { key: "niveauGravite",     label: "Niveau de gravité" },
  { key: "descriptionPlainte",label: "Description de la plainte" },
];

const COLONNES_APERCU = [
  { key: "numeroReference",   label: "Référence"  },
  { key: "nomPrenom",         label: "Plaignant"  },
  { key: "codePap",           label: "Code PAP"   },
  { key: "dateEnregistrement",label: "Date"       },
  { key: "categorisation",    label: "Catégorie"  },
  { key: "niveauGravite",     label: "Gravité"    },
  { key: "statut",            label: "Statut"     },
];

// Champs à vérifier pour les doublons
const CHAMPS_UNIQUES: { key: string; label: string }[] = [
  { key: "numeroReference", label: "Numéro de référence" },
  { key: "codePap",         label: "Code PAP" },
];

@Component({
  selector: "app-plainte-preview",
  templateUrl: "./plainte-preview.component.html",
  standalone: true,
  imports: [CommonModule],
})
export class PlaintePreviewComponent implements OnChanges {
  @Input() dataExcel: any[] = [];

  colonnes = COLONNES_APERCU;
  validationErrors: ValidationError[] = [];

  ngOnChanges(): void {
    this.valider();
  }

  private valider(): void {
    this.validationErrors = [];
    this.verifierChampsObligatoires();
    this.verifierUniciteChamps();
  }

  private verifierChampsObligatoires(): void {
    CHAMPS_OBLIGATOIRES.forEach(({ key, label }) => {
      const lignesVides = this.dataExcel
        .map((row, i) =>
          row[key] === undefined || row[key] === null || row[key] === "" ? i + 2 : null
        )
        .filter((i): i is number => i !== null);

      if (lignesVides.length > 0) {
        this.validationErrors.push({
          type: "EMPTY_VALUES",
          message: `"${label}" contient des valeurs manquantes`,
          rows: lignesVides,
        });
      }
    });
  }

  /**
   * Vérifie l'unicité pour plusieurs champs (numeroReference, codePap, etc.)
   */
  private verifierUniciteChamps(): void {
    CHAMPS_UNIQUES.forEach(({ key, label }) => {
      const compteur: Record<string, number[]> = {};
      
      this.dataExcel.forEach((row, i) => {
        const valeur = row[key];
        if (valeur !== undefined && valeur !== null && valeur !== "") {
          const valeurStr = String(valeur); // Convertit en string pour clé objet
          if (!compteur[valeurStr]) compteur[valeurStr] = [];
          compteur[valeurStr].push(i + 2);
        }
      });

      Object.entries(compteur).forEach(([valeur, lignes]) => {
        if (lignes.length > 1) {
          this.validationErrors.push({
            type: "DUPLICATE",
            message: `${label} "${valeur}" en doublon`,
            rows: lignes,
          });
        }
      });
    });
  }

  hasErrors(): boolean {
    return this.validationErrors.length > 0;
  }

  badgeStatut(statut: string): string {
    if (statut === "FERMEE")   return "badge bg-success";
    if (statut === "EN COURS") return "badge bg-warning text-dark";
    if (statut === "OUVERTE")  return "badge bg-primary";
    return "badge bg-secondary";
  }

  badgeGravite(gravite: string): string {
    if (["Elevé", "ELEVE", "Eléve"].includes(gravite)) return "badge bg-danger";
    if (gravite === "Moyen")  return "badge bg-warning text-dark";
    if (gravite === "Faible") return "badge bg-success";
    return "badge bg-secondary";
  }

  isGravite(key: string): boolean { return key === "niveauGravite"; }
  isStatut(key:  string): boolean { return key === "statut"; }
}