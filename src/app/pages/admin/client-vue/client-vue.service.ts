import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})
export class ClientVueService {
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    listeBureaux = [
        {
            code: '528651571NT',
            libelle: 'Bureau 1',
        },
        {
            code: '685377421YT',
            libelle: 'Bureau 2',
        },
        {
            code: '685377421YT',
            libelle: 'Bureau 3',
        },
        {
            code: '884960091RT',
            libelle: 'Bureau 4',
        },
    ];

    listeRole = [
        {
            id: 1,
            libelle: 'Admin',
        },
        {
            id: 2,
            libelle: 'User',
        },
        {
            id: 3,
            libelle: 'Agent',
        }
    ];

    listeCaise = [
        {
            id: 1,
            libelle: 'caisse 1',
            bureau: 'bureau 1',
        },
        {
            id: 2,
            libelle: 'caisse 2',
            bureau: 'bureau 1',
        },
        {
            id: 3,
            libelle: 'caisse 3',
            bureau: 'bureau 2',
        }
    ];

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any> {
        return this._data.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getDataBureau() {
        return this.listeBureaux;
    }

    getDataRole() {
        return this.listeRole;
    }

    getDataCaisse() {
        return this.listeCaise;
    }


    ajouter(url, data) {
        return this._httpClient.post(environment.apiUrl + url, data).pipe(
            switchMap((response: any) => of(response))
        );
    }

    modifierSignataire(signataire) {
        return this._httpClient.put(environment.apiUrl + 'employeur/' + signataire.id, signataire).pipe(
            switchMap((response: any) => of(response))
        );
    }

    modifierDAt(signataire) {
        return this._httpClient.put(environment.apiUrl + 'depot-terme/' + signataire.id, signataire).pipe(
            switchMap((response: any) => of(response))
        );
    }


    getSignataire(max, offset) {
        return this._httpClient.get(environment.apiUrl + 'signataire' + '?max=' + max + '&offset=' + offset).pipe(response => response);
    }

    deleteSignataire(id) {
        return this._httpClient.delete(environment.apiUrl + 'employeur/' + id);
    }

    getGestionnaire(idGestionnaire) {
        return this._httpClient.get(environment.apiUrl + 'agent' + '/' + idGestionnaire).pipe(response => response);
    }

    getInfos(naturePieceId, numeroPiece) {
        return this._httpClient.get(environment.apiUrl + 'personne-physique/piece' + '/' + naturePieceId + '/' + numeroPiece).pipe(response => response);
    }

    changeClient(url, clientId) {
        return this._httpClient.get(environment.apiUrl + url + '/' + clientId).pipe(response => response);
    }

    getElementById(id, url) {
        return this._httpClient.get(environment.apiUrl + url + '/' + id).pipe(response => response);
    }

    changeStatusCredit(url, id) {
        return this._httpClient.get(environment.apiUrl + url + '/' + id).pipe(response => response);
    }

    basculerCredit(url, data) {
        return this._httpClient.post(environment.apiUrl + url, data).pipe(response => response);
    }
    leverSuspensionCredit(url, data) {
        return this._httpClient.post(environment.apiUrl + url, data).pipe(response => response);
    }
    rejeterPaiementSalaire(url, data) {
        return this._httpClient.post(environment.apiUrl + url+'/'+data.id, data).pipe(response => response);
    }

    annulerCredit(id, data) {
        return this._httpClient.post(environment.apiUrl + 'credit/rejeter/' + id, data);
    }


    updateEntity(url, id,data) {
        return this._httpClient.put(environment.apiUrl + url  + '/' + id, data).pipe(
            switchMap((response: any) => of(response))
        );
    }

    updateSignature(clientId: string, data: any) {
        return this._httpClient.post(`${environment.apiUrl}client/set-signature/${clientId}`, data).pipe(
            switchMap((response: any) => of(response))
        );
    }

    saveStoreFile(url, data) {
        return this._httpClient.post(environment.apiUrl + url, data).pipe(
            switchMap((response: any) => of(response))
        );
    }
}
