# CLAUDE — Adaptation Frontend Angular : Module Plainte (Invodis)

## Contexte du projet
Je travaille sur le projet **Invodis** (Angular frontend).  
J'ai déjà un module plainte. Je dois l'adapter pour correspondre au nouveau format du fichier Excel (35 colonnes).

**Conventions du projet à respecter :**
- Services héritent de `ServiceParent`
- Composants utilisent `app-page-actions`, `tableau`, `app-loader-data`
- Import Excel via `XLSX` (SheetJS) côté frontend pour preview, puis envoi au backend
- `SnackBarService` pour les confirmations
- `ToastrService` pour les notifications (succès/erreur)
- Couleur principale Invodis : `#D45C00`
- `takeUntil(this.destroy$)` pour les souscriptions
- `currentProjectId` récupéré depuis `LocalService`

---

## ÉTAPE 1 — Mettre à jour le modèle `Plainte`

Remplace mon fichier `plainte.model.ts` existant par :

```typescript
export interface Plainte {
  id?: number;

  // Identification
  statut?: string;
  numeroReference?: string;
  dateEnregistrement?: string;
  moisReception?: string;

  // PAP
  codePap?: string;
  nomPrenom?: string;
  mandataire?: string;
  sexe?: string;
  telephone?: string;
  perimetreGmp?: string;
  numeroParcelle?: string;
  typeCarteIdentite?: string;
  cin?: string;
  typePap?: string;
  villageQuartier?: string;
  plainteParZone?: string;

  // Plainte
  categorisation?: string;
  objetPlainte?: string;
  niveauGravite?: string;
  descriptionPlainte?: string;
  facilitateur?: string;

  // Résolution
  descriptionReglement?: string;
  observations?: string;
  communicationResolution1?: string;
  dateTraitementConsultant?: string;
  dateVisite?: string;
  communicationResolution2?: string;
  dateTraitementClm?: string;
  communicationResolution3?: string;
  dateTraitementCcd?: string;
  resolutionPlainte?: string;
  siNonExpliquez?: string;
  prochaineEtape?: string;
  dateCloture?: string;
  delaiResolution?: string;

  // Audit
  projectId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlainteImportResult {
  totalLignes: number;
  importees: number;
  doublons: number;
  erreurs: number;
  erreurDetails: string[];
}
```

---

## ÉTAPE 2 — Mettre à jour `PlainteService`

Adapte mon `plainte.service.ts` existant (hérite de `ServiceParent`). Garde les méthodes existantes et ajoute/modifie :

```typescript
// Constantes URL
const BASE_URL = 'plainte';

// Méthodes à avoir :
importerExcel(file: File, projectId: number): Observable<PlainteImportResult>
  // → POST /api/plainte/import (FormData avec "file" et "projectId")

getByProject(projectId: number, page = 0, size = 20): Observable<any>
  // → GET /api/plainte?projectId=X&page=Y&size=Z

getById(id: number): Observable<Plainte>
  // → GET /api/plainte/{id}

getByStatut(projectId: number, statut: string): Observable<Plainte[]>
  // → GET /api/plainte/statut/{statut}?projectId=X

deletePlainte(id: number): Observable<any>
  // → DELETE /api/plainte/{id}
```

---

## ÉTAPE 3 — Adapter le composant liste `PlainteListComponent`

Adapte mon composant liste existant. Voici ce que je veux :

### Headers du tableau à afficher

```typescript
headers = [
  { key: 'numeroReference',  label: 'Référence',      sortable: true  },
  { key: 'nomPrenom',        label: 'Plaignant',       sortable: true  },
  { key: 'codePap',          label: 'Code PAP',        sortable: false },
  { key: 'dateEnregistrement', label: 'Date',          sortable: true  },
  { key: 'categorisation',   label: 'Catégorie',       sortable: true  },
  { key: 'niveauGravite',    label: 'Gravité',         sortable: true  },
  { key: 'statut',           label: 'Statut',          sortable: true  },
  { key: 'villageQuartier',  label: 'Localité',        sortable: false },
  { key: 'facilitateur',     label: 'Facilitateur',    sortable: false },
];
```

### Badges de couleur pour les colonnes clés

Dans le template HTML, affiche des badges colorés :

**Statut :**
```html
<!-- FERMEE → vert, EN COURS → orange, OUVERT → bleu -->
<span [ngClass]="{
  'badge-vert':   item.statut === 'FERMEE',
  'badge-orange': item.statut === 'EN COURS',
  'badge-bleu':   item.statut === 'OUVERTE'
}">{{ item.statut }}</span>
```

**Niveau de gravité :**
```html
<!-- Elevé/ELEVE → rouge, Moyen → orange, Faible → vert -->
<span [ngClass]="{
  'badge-rouge':  ['Elevé','ELEVE','Eléve'].includes(item.niveauGravite),
  'badge-orange': item.niveauGravite === 'Moyen',
  'badge-vert':   item.niveauGravite === 'Faible'
}">{{ item.niveauGravite }}</span>
```

### Import Excel (adapter la logique existante)

La lecture Excel côté frontend (preview avant import) doit mapper les colonnes dans cet ordre exact :

```typescript
// Dans fileUpload() / processExcelFile()
// Mapping colonnes Excel → champs objet (index 0-based)
const COLONNES_PLAINTE = [
  'statut',                    // 0
  'numeroReference',           // 1
  'dateEnregistrement',        // 2
  'moisReception',             // 3
  'codePap',                   // 4
  'nomPrenom',                 // 5
  'mandataire',                // 6
  'sexe',                      // 7
  'telephone',                 // 8
  'perimetreGmp',              // 9
  'numeroParcelle',            // 10
  'typeCarteIdentite',         // 11
  'cin',                       // 12
  'typePap',                   // 13
  'villageQuartier',           // 14
  'plainteParZone',            // 15
  'categorisation',            // 16
  'objetPlainte',              // 17
  'niveauGravite',             // 18
  'descriptionPlainte',        // 19
  'facilitateur',              // 20
  'descriptionReglement',      // 21
  'observations',              // 22
  'communicationResolution1',  // 23
  'dateTraitementConsultant',  // 24
  'dateVisite',                // 25
  'communicationResolution2',  // 26
  'dateTraitementClm',         // 27
  'communicationResolution3',  // 28
  'dateTraitementCcd',         // 29
  'resolutionPlainte',         // 30
  'siNonExpliquez',            // 31
  'prochaineEtape',            // 32
  'dateCloture',               // 33
  'delaiResolution',           // 34
];

// Utiliser une lecture par index (pas par nom de colonne header)
// car les noms de colonnes Excel ont des accents et espaces problématiques
private processExcelFile(binaryData: string): void {
  const workbook = XLSX.read(binaryData, { type: 'binary' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  // header:1 = tableau de tableaux, ignorer ligne 0 (en-tête)
  const rows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
  
  this.headings = COLONNES_PLAINTE; // noms camelCase pour le backend
  this.dataExcel = rows
    .slice(1) // ignorer en-tête
    .filter(row => row[1]) // ignorer lignes sans numéro de référence
    .map(row => {
      const obj: any = {};
      COLONNES_PLAINTE.forEach((col, i) => {
        obj[col] = row[i] ?? null;
      });
      return obj;
    });
}
```

### Envoi au backend

Dans `importData()`, envoyer via FormData avec le fichier original (pas les données JSON) :

```typescript
importData(): void {
  this.snackbar.showConfirmation('Confirmer l\'import des plaintes ?')
    .then(result => {
      if (result?.value !== true) return;
      
      // Option A — envoyer le fichier brut au backend (recommandé)
      const formData = new FormData();
      formData.append('file', this.selectedFile!);
      formData.append('projectId', this.currentProjectId.toString());
      
      this.loadData = true;
      this.plainteService.importerExcel(this.selectedFile!, +this.currentProjectId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: PlainteImportResult) => {
            this.toastr.success(
              `${result.importees} plainte(s) importée(s), ${result.doublons} doublon(s) ignoré(s)`
            );
            this.resetDataFromExcel();
            this.loadPlaintes();
            this.loadData = false;
          },
          error: err => {
            this.loadData = false;
            this.toastr.error('Erreur lors de l\'import');
          }
        });
    });
}
```

---

## ÉTAPE 4 — Adapter le composant détail `PlainteDetailComponent` (modal)

Adapte le modal de détail existant pour afficher toutes les informations organisées en sections :

```
Section 1 : IDENTIFICATION
  - Référence | Statut | Date enregistrement | Mois réception

Section 2 : PLAIGNANT (PAP)
  - Nom & Prénom | Code PAP | Sexe | Téléphone
  - CIN | Type carte | Type PAP | Mandataire

Section 3 : LOCALISATION
  - Village/Quartier | Zone | Périmètre GMP | N° Parcelle

Section 4 : PLAINTE
  - Catégorisation | Objet | Niveau de gravité
  - Description complète | Facilitateur

Section 5 : RÉSOLUTION
  - Description règlement | Observations
  - Communication Résolution 1 + date consultant
  - Date visite
  - Communication Résolution 2 + date CLM
  - Communication Résolution 3 + date CCD
  - Résolution finale | Prochaine étape
  - Date clôture | Délai de résolution
```

Utilise des `mat-expansion-panel` ou des onglets (`mat-tab`) pour organiser ces sections.

Affiche les badges colorés pour Statut et Niveau de Gravité (même logique que la liste).

---

## ÉTAPE 5 — Adapter le composant formulaire `PlainteFormComponent`

Adapte le formulaire de création/édition existant. Organise en étapes (`mat-stepper`) ou en sections.

**Champs obligatoires :** `nomPrenom`, `dateEnregistrement`, `categorisation`, `objetPlainte`, `niveauGravite`, `descriptionPlainte`

**Valeurs des selects :**
```typescript
statuts = ['OUVERTE', 'EN COURS', 'FERMEE'];
niveauxGravite = ['Faible', 'Moyen', 'Elevé'];
categorisations = ['CAS D\'ERREUR', 'CAS DE CORRECTION', 'CAS D\'OMISSION', 'COMPENSATION FAIBLE'];
typesPap = ['Agricole périmetre', 'Agricole zone de servitude', 'Habitat zone de servitude', 'Place d\'affaire zone de servitude'];
sexes = ['Masculin', 'Feminin'];
```

---

## Notes importantes
- Conserver les patterns existants du projet (ServiceParent, destroy$, pagination)
- La couleur Invodis est `#D45C00`
- Le `currentProjectId` est toujours récupéré depuis `LocalService`
- Garder la compatibilité avec le composant `tableau` existant
- Ne pas casser les routes existantes du module plainte