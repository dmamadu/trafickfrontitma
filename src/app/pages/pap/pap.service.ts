import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RootService } from 'src/app/core/services/root.service';

/** Catégorie dans l'URL de la fiche PAP et de l'API /paps (voir PapFicheController). */
export type CategoriePap = 'habitat' | 'agricole' | 'place-affaire' | 'economique';

const CATEGORIE_PAR_TYPE: Record<string, CategoriePap> = {
  PAPHABITAT: 'habitat',
  PAPAGRICOLE: 'agricole',
  PAPPLACEAFFAIRE: 'place-affaire',
  PAPECONOMIQUE: 'economique',
};

@Injectable({
  providedIn: 'root'
})
export class PapService extends RootService {

  /** Catégorie d'une PAP à partir de son champ `type` (PAPHABITAT…), ou null. */
  static categorieDe(pap: any): CategoriePap | null {
    return CATEGORIE_PAR_TYPE[pap?.type] ?? null;
  }

  getFichePap<T>(categorie: CategoriePap, id: number | string, projectId: number | string): Observable<T> {
    const params = new HttpParams().set('projectId', String(projectId));
    return this.http.get<T>(`${this.url}paps/${categorie}/${id}`, { params });
  }

  dedommagerPap<T>(categorie: CategoriePap, id: number | string, projectId: number | string): Observable<T> {
    const params = new HttpParams().set('projectId', String(projectId));
    return this.http.put<T>(`${this.url}paps/${categorie}/${id}/dedommager`, null, { params });
  }

  changerPhotoPap<T>(categorie: CategoriePap, id: number | string, projectId: number | string, nomFichier: string): Observable<T> {
    const params = new HttpParams().set('projectId', String(projectId));
    return this.http.put<T>(`${this.url}paps/${categorie}/${id}/photo`, nomFichier, { params });
  }
}
