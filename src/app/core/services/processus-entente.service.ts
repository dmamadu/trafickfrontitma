import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessusEntenteService extends RootService {

   private next = 'ententeSynchroniser';

  // constructor(private http: HttpClient) {}

  etablirCompensation(ententeId: number, projectId: number): Observable<any> {
    const params = new HttpParams().set('projectId', projectId?.toString());
    return this.http.post(`${this.url}${this.next}/${ententeId}/processus/etablir-compensation`, {}, { params });
  }

  informerPap(ententeId: any, modeInformation: string, detailsInformation: string, projectId: number): Observable<any> {
    const params = new HttpParams().set('projectId', projectId?.toString());
    return this.http.post(`${this.url}${this.next}/${ententeId}/processus/informer-pap`, { modeInformation, detailsInformation }, { params });
  }

  obtenirAccordPap(ententeId: number, preuveAccord: string, projectId: number): Observable<any> {
    const params = new HttpParams().set('preuveAccord', preuveAccord).set('projectId', projectId?.toString());
    return this.http.post(
        `${this.url}${this.next}/${ententeId}/processus/obtenir-accord`,
        null,
        { params: params }
    );
}

  effectuerPaiement(ententeId: number, preuvePaiement: string, projectId: number): Observable<any> {
    const params = new HttpParams().set('referencePaiement', preuvePaiement).set('projectId', projectId?.toString());
    return this.http.post(
        `${this.url}${this.next}/${ententeId}/processus/effectuer-paiement`,
        null,
        { params: params }
    );
}



donnerFormation(ententeId: number, typeFormation: string, formateur: string, projectId: number): Observable<any> {
  const params = new HttpParams()
    .set('typeFormation', typeFormation)
    .set('formateur', formateur)
    .set('projectId', projectId?.toString());
      return this.http.post(
        `${this.url}${this.next}/${ententeId}/processus/donner-formation`,
        null,
        { params: params }
    );
}

effectuerSuivi(ententeId: number, resultatSuivi: string, commentairesSuivi: string, projectId: number): Observable<any> {
  const params = new HttpParams()
    .set('resultatSuivi', resultatSuivi)
    .set('commentairesSuivi', commentairesSuivi || '')
    .set('projectId', projectId?.toString());
          return this.http.post(
        `${this.url}${this.next}/${ententeId}/processus/effectuer-suivi`,
        null,
        { params: params }
    );
}



  chargerEntente(ententeId: number): Observable<any> {
    return this.http.post(`${this.url}${this.next}/${ententeId}/auto-create`, {});
  }

}