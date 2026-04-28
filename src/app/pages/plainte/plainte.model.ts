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
