import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
//import {CONSTANTES} from 'app/modules/presentation/admin/model/constantes';
import * as crypto from 'crypto-js';
//import {environment} from 'environments/environment';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import { CONSTANTES } from '../models/constantes';
import { environment } from 'src/environments/environment';
import { Parametrages, Privilege, Utilisateur } from '../models/recherche.types';


@Injectable({
    providedIn: 'root'
})
export class CoreService {
    constantes = CONSTANTES;
    listStatuts: any = [
        {name: 'ACTIF', value: 'ACTIF', badge: 'status-success'},
        {name: 'INACTIF', value: 'INACTIF', badge: 'status-warning'},

        {name: 'SAISI', value: 'SAISI', badge: 'status-accent'},
        {name: 'SAISIE', value: 'SAISIE', badge: 'status-accent'},
        {name: 'VALIDE', value: 'VALIDE', badge: 'status-success2'},
        {name: 'COMPTABILISE', value: 'COMPTABILISE', badge: 'status-success1'},
        {name: 'FINANCE', value: 'FINANCE', badge: 'status-warning'},
        {name: 'ANNULE', value: 'ANNULE', badge: 'status-error'},
        {name: 'OUVERT', value: 'OUVERT', badge: 'status-success1'},
        {name: 'FERMER', value: 'FERME', badge: 'status-error'},
        {name: 'ARRETE', value: 'ARRETE', badge: 'status-error'},
        {name: 'REJETE', value: 'REJETE', badge: 'status-error'},
        {name: 'INTERDIT', value: 'INTERDIT', badge: 'status-error'},
        {name: 'SURVEILLE', value: 'SURVEILLE', badge: 'status-accent'},
        {name: 'CLOTURE', value: 'CLOTURE', badge: 'status-grey'},
        {name: 'IMMOBILISE', value: 'IMMOBILISE', badge: 'status-blue-clair'},
        {name: 'SOUFFRANCE', value: 'EN_SOUFFRANCE', badge: 'status-brown'},
        {name: 'CONTENTIEUX', value: 'CONTENTIEUX', badge: 'status-error'},
        {name: 'ACCEPTE', value: 'ACCEPTE', badge: 'status-success'},
        {name: 'aEteExtoune', value: 'aEteExtoune', badge: 'status-brown'},
    ];

    // Utilisateur
    private _utilisateurs: BehaviorSubject<Utilisateur[] | null> = new BehaviorSubject(null);

    // Privilege
    private _privileges: BehaviorSubject<Privilege[] | null> = new BehaviorSubject(null);

    // parametrage
    private _parametrages: BehaviorSubject<Parametrages[] | null> = new BehaviorSubject(null);
    private _modelLists: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient
    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        throw new Error('Method not implemented.');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------


    /**
     * Getter for Utilisateurs
     */
    get utilisateurs$(): Observable<Utilisateur[]> {
        return this._utilisateurs.asObservable();
    }

    get modelLists$(): Observable<any[]> {
        return this._modelLists.asObservable();
    }

    /**
     * Getter for Privileges
     */
    get privileges$(): Observable<Privilege[]> {
        return this._privileges.asObservable();
    }

    /**
     * Getter for Parametrages
     */
    get parametrages$(): Observable<Parametrages[]> {
        return this._parametrages.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    doRechercher(data, url, type?, customBaseUrl?) {
        if (!type) {
            if (data.isGlobal) {
                let options = new HttpParams();
                const keys = Object.keys(data);
                for (const key of keys) {
                    options = options.set(key, data[key]);
                }

                return this._httpClient.get((customBaseUrl ? customBaseUrl : environment.apiUrl) + url, {params:options})
                    .pipe(map((response) => {
                        response['list'] = response[this.constantes.RESPONSE_DATA];
                        return response;
                    }));
            } else {
                const keys = Object.keys(data.searchQuery);
                let newMap = {};
                for (const key of keys) {
                    if (data.searchQuery[key] == '') {
                        delete data.searchQuery[key];
                    } else {
                        newMap = {...newMap, ...{[key]: data.searchQuery[key]}};
                    }
                }
                return this._httpClient.get((customBaseUrl ? customBaseUrl : environment.apiUrl) + url + '?isGlobal=' + data.isGlobal + '&searchQuery=' + encodeURIComponent(JSON.stringify(newMap)))
                    .pipe(map((response) => {
                        response['list'] = response[this.constantes.RESPONSE_DATA];
                        return response;
                    }));
            }
        } else {
            if (data.isGlobal) {

                let options = new HttpParams();
                const keys = Object.keys(data);
                for (const key of keys) {
                    options = options.set(key, data[key]);
                }

                return this._httpClient.get((customBaseUrl ? customBaseUrl : environment.apiUrl) + url, {params:options})
                    .pipe(map((response) => {
                        // this._changeDetectorRef.markForCheck();
                        return {list: response[this.constantes.RESPONSE_DATA], total: response['total']};
                    }));
            } else {
                const keys = Object.keys(data.searchQuery);
                let newMap = {};
                for (const key of keys) {
                    if (data.searchQuery[key] == '') {
                        delete data.searchQuery[key];
                    } else {
                        newMap = {...newMap, ...{[key]: data.searchQuery[key]}};
                    }
                }
                return this._httpClient.get((customBaseUrl ? customBaseUrl : environment.apiUrl) + url + '?isGlobal=' + data.isGlobal + '&' + type.label + '=' + type.name + '&searchQuery=' + encodeURIComponent(JSON.stringify(newMap)))
                    .pipe(map((response) => {
                        // this._changeDetectorRef.markForCheck();
                        return {list: response[this.constantes.RESPONSE_DATA], total: response['total']};
                    }));
            }
        }
    }

    doRechercherCritere(data, url, type?, customBaseUrl?) {
        if (!type) {
            if (data.isGlobal) {
                let options = new HttpParams();
                const keys = Object.keys(data);
                for (const key of keys) {
                    options = options.set(key, data[key]);
                }

                return this._httpClient.get((customBaseUrl ? customBaseUrl : environment.apiUrl) + url, {params:options})
                    .pipe(map((response) => {
                        response['list'] = response[this.constantes.RESPONSE_DATA];
                        return response;
                    }));
            } else {
                const keys = Object.keys(data.searchQuery);
                let newMap = {};
                for (const key of keys) {
                    if (data.searchQuery[key] == '') {
                        delete data.searchQuery[key];
                    } else {
                        newMap = {...newMap, ...{[key]: data.searchQuery[key]}};
                    }
                }
                return this._httpClient.get((customBaseUrl ? customBaseUrl : environment.apiUrl) + url + '&isGlobal=' + data.isGlobal + '&searchQuery=' + encodeURIComponent(JSON.stringify(newMap)))
                    .pipe(map((response) => {
                        response['list'] = response[this.constantes.RESPONSE_DATA];
                        return response;
                    }));
            }
        } else {
            if (data.isGlobal) {

                let options = new HttpParams();
                const keys = Object.keys(data);
                for (const key of keys) {
                    options = options.set(key, data[key]);
                }

                return this._httpClient.get((customBaseUrl ? customBaseUrl : environment.apiUrl) + url, {params:options})
                    .pipe(map((response) => {
                        // this._changeDetectorRef.markForCheck();
                        return {list: response[this.constantes.RESPONSE_DATA], total: response['total']};
                    }));
            } else {
                const keys = Object.keys(data.searchQuery);
                let newMap = {};
                for (const key of keys) {
                    if (data.searchQuery[key] == '') {
                        delete data.searchQuery[key];
                    } else {
                        newMap = {...newMap, ...{[key]: data.searchQuery[key]}};
                    }
                }
                return this._httpClient.get((customBaseUrl ? customBaseUrl : environment.apiUrl) + url + '&isGlobal=' + data.isGlobal + '&' + type.label + '=' + type.name + '&searchQuery=' + encodeURIComponent(JSON.stringify(newMap)))
                    .pipe(map((response) => {
                        // this._changeDetectorRef.markForCheck();
                        return {list: response[this.constantes.RESPONSE_DATA], total: response['total']};
                    }));
            }
        }
    }

    getListItemByCodeItem(code, url) {
        return this._httpClient.get(environment.apiUrl + url + '/' + code).pipe(response => response);
    }

    searchClientByNature(code, url) {
        return this._httpClient.get(environment.apiUrl + url + '/' + code.nature + '/' + code.numeroPiece).pipe(response => response);
    }
    searchClientCompteByNature(code, url) {
        return this._httpClient.get(environment.apiUrl + url + '/' + code.nature + '/' + code.numeroPiece+'?compte='+code.compte+'&typeTransaction='+code.typeTransaction).pipe(response => response);
    }

    searchClientByNatureMorale(code, url) {
        return this._httpClient.get(environment.apiUrl + url + '/' + code.ninea).pipe(response => response);
    }

    listFormulaire(url, params?) {
        let options = new HttpParams();
        if (!params) {
            params = {max: environment.max, offset: environment.offset}
        }
        if (!params['max']) {
            params['max'] = environment.max;
        }
        if (!params['offset']) {
            params['offset'] = environment.offset;
        }
        const keys = Object.keys(params);
        for (const key of keys) {
            options = options.set(key, params[key]);
        }
        return this._httpClient.get(environment.apiUrl + url, {params: options})
            .pipe(response => response);
    }
    addFileExtourne(data) {
        return this._httpClient.post(environment.apiUrl + 'extourner-transactions-par-fichier',data).pipe(
            switchMap((response: any) =>
                // Return a new observable with the response
                of(response)
            )
        );
    }
    rapportBic(dateFormatee, url) {
        return this._httpClient.get(environment.apiUrl + url + dateFormatee, {responseType: 'blob'})
            .pipe(response => response);
    }

    getFileUrl( url) {
        return this._httpClient.get(url, {responseType: 'blob'})
            .pipe(response => response);
    }


    addItem(item, url): Observable<any> {
        return this._httpClient.post(environment.apiUrl + url, item).pipe(
            switchMap((response: any) => of(response))
        );
    }

    updateItem(item, id, url): Observable<any> {
        return this._httpClient.put(environment.apiUrl + url + '/' + id, item).pipe(
            switchMap((response: any) => of(response))
        );
    }
    updateCompensation(item, url): Observable<any> {
        return this._httpClient.get(environment.apiUrl + url + '/' , item).pipe(
            switchMap((response: any) => of(response))
        );
    }

    list(url, offset, max, customBaseUrl?): Observable<any[]> {
        return this._httpClient.get<any[]>((customBaseUrl ? customBaseUrl : environment.apiUrl) + url + '?max=' + max + '&offset=' + offset + '&order=desc&sort=dateCreated').pipe(
            tap((response) => {
                this._modelLists.next(response);

            })
        );
  }

  getPapByCodePap(type: string, codePap: string): Observable<any> {
    let endpoint = '';
    switch (type) {
      case 'agricole':
        endpoint = 'papAgricole';
        break;
      case 'placeAffaire':
        endpoint = 'databasePapPlaceAffaire';
        break;
      default:
        throw new Error('Type invalide : ' + type);
    }
    return this._httpClient.get<any>(`${environment.apiUrl}${endpoint}/byCodePap/${codePap}`);
  }

    balanceGeneral(url,item): Observable<any> {
        return this._httpClient.post(environment.apiUrl + url, item).pipe(
            switchMap((response: any) => of(response))
        );
    }
    query(url: string, params?: any, customBaseUrl?: string) {
        let options = new HttpParams();
        if (!params) {
            params = {max: environment.max, offset: environment.offset}
        }
        if (!params['max']) {
            params['max'] = environment.max;
        }
        if (!params['offset']) {
            params['offset'] = environment.offset;
        }
        const keys = Object.keys(params);
        for (const key of keys) {
            options = options.set(key, params[key]);
        }
        return this._httpClient.get(customBaseUrl ? customBaseUrl : environment.apiUrl + url, {params: options})
            .pipe(response => response);
    }

    listv2(url, offset, max): Observable<any[]> {

        return this._httpClient.get<any[]>(environment.apiUrl + url + '&max=' + max + '&offset=' + offset + '&order=desc').pipe(
            tap((response) => {
                this._modelLists.next(response);

            })
        );
    }
    listComptePoste(url, offset, max): Observable<any[]> {

        return this._httpClient.get<any[]>(environment.apiUrl + url + '?max=' + max + '&offset=' + offset + '&order=desc').pipe(
            tap((response) => {
                this._modelLists.next(response);

            })
        );
    }
    listExercice(url ,offset, max): Observable<any[]> {

        return this._httpClient.get<any[]>(environment.apiUrl + url + '?max=' + max + '&offset=' + offset  +'&order=desc&sort=annee').pipe(
            tap((response) => {
                this._modelLists.next(response);

            })
        );
    }
    listv2Depot(url, offset, max): Observable<any[]> {

        return this._httpClient.get<any[]>(environment.apiUrl + url + '&max=' + max + '&offset=' + offset + '&order=desc&sort=dateCreated').pipe(
            tap((response) => {
                this._modelLists.next(response);

            })
        );
    }
  listRapport(url): Observable<any[]> {

        return this._httpClient.get<any[]>(environment.apiUrl + url ).pipe(
            tap((response) => {
                this._modelLists.next(response);

            })
        );
    }

    listCredit(url, offset, max, statut?): Observable<any[]> {
        if (statut != '') {
            return this._httpClient.get<any[]>(environment.apiUrl + url + '?max=' + max + '&offset=' + offset + '&order=desc' + '&statut=' + statut).pipe(
                tap((response) => {
                    this._modelLists.next(response);
                })
            );
        } else {
            return this._httpClient.get<any[]>(environment.apiUrl + url + '?max=' + max + '&offset=' + offset + '&order=desc').pipe(
                tap((response) => {
                    this._modelLists.next(response);
                })
            );
        }

    }

    lists(url, offset, max): Observable<any[]> {

        return this._httpClient.get<any[]>(environment.apiUrl + url + '&max=' + max + '&offset=' + offset + '&order=desc').pipe(
            tap((response) => {
                this._modelLists.next(response);

            })
        );
    }

    liste(url): Observable<any[]> {

        return this._httpClient.get<any[]>(environment.apiUrl + url).pipe(
            tap((response) => {
                this._modelLists.next(response);

            })
        );
    }


    rechercheParCritere(url, data) {
        let params = new HttpParams();
        const keys = data ? Object.keys(data) : [];
        for (const key of keys) {
            params = params.set(key, data[key]);
        }
        return this._httpClient.get(environment.apiUrl + url, {params}).pipe(response => response);
    }

    deleteItem(item, url) {
        return this._httpClient.delete(environment.apiUrl + url + '/' + item, item)
            .pipe(response => response);
    }

    getStatut(statut) {
        const tab = this.listStatuts.filter(el => el.value == statut);
        if (tab.length != 0) {
            return tab[0];
        }
    }

    getElementByIdCaisse(id, url, offset, max) {
        return this._httpClient.get(environment.apiUrl + url + '/' + id + '?max=' + max + '&offset=' + offset + '&order=desc').pipe(response => response);
    }

    getElement(id, url) {
        return this._httpClient.get(environment.apiUrl + url + '/' + id).pipe(response => response);
    }
    cloture(id, url) {
        return this._httpClient.get(environment.apiUrl + url  + id).pipe(response => response);
    }

    cloturerCompte(compte) {
        return this._httpClient.get(environment.apiUrl + 'compte-cloturer' + '/' + compte.compteId + '/' + compte.abandonFrais)
            .pipe(response => response);
    }
    leverCompteInactif(url,compte) {
        return this._httpClient.post(environment.apiUrl + url, compte).pipe(
            switchMap((response: any) => of(response))
        );
    }

    getSoldes(url) {
        return this._httpClient.get(environment.apiUrl + url )
            .pipe(response => response);
    }
    leverCompteDormant(compte) {
        return this._httpClient.get(environment.apiUrl + 'lever-compte-dormant' + '/' + compte.id )
            .pipe(response => response);
    }

    liberer(id) {
        return this._httpClient.get(environment.apiUrl + 'liberer-fonds' + '/' + id)
            .pipe(response => response);
    }



    signataire(id) {
        return this._httpClient.delete(environment.apiUrl + 'signataire-client' + '/' + id)
            .pipe(response => response);
    }

    getElementByIdTransaction(item, url, offset, max, ig?, sq?): Observable<any[]> {
        if (ig && sq) {
            return this._httpClient.post(environment.apiUrl + url + '?max=' + max + '&offset=' + offset + '&order=desc&isGlobal=' + ig + '&searchQuery=' + sq, item).pipe(
                switchMap((response: any) => of(response))
            );
        } else {
            return this._httpClient.post(environment.apiUrl + url + '?max=' + max + '&offset=' + offset + '&order=desc', item).pipe(
                switchMap((response: any) => of(response))
            );
        }
    }

    getAttributComplementaire(item, url) {
        return this._httpClient.post(environment.apiUrl + url, item).pipe(
            switchMap((response: any) => of(response))
        );
    }

    updateAttributComplementaire(idAttributComplementaire, compte) {
        return this._httpClient.put(environment.apiUrl + 'attribut-complementaire/' + idAttributComplementaire, compte).pipe(
            switchMap((response: any) =>
                // Return a new observable with the response
                of(response)
            )
        );
    }

    /**
     * Cette fonction permet de bloquer un compte
     *
     * @param item
     * @param url
     */
    extournerTransaction(data) {
        return this._httpClient.post(environment.apiUrl + 'extourner-transaction', data)
            .pipe(response => response);
    }

    annulerTransaction(data) {
        return this._httpClient.post(environment.apiUrl + 'annuler-transaction', data)
            .pipe(response => response);
    }
    rejeterDemand(data,url,id) {
        return this._httpClient.post(environment.apiUrl + url + id, data)
            .pipe(response => response);
    }

    validerTransaction(data, url) {
        return this._httpClient.post(environment.apiUrl + url, data)
            .pipe(response => response);
    }
    validerDemandeCred(data,id, url) {
        return this._httpClient.get(environment.apiUrl + url + '/' + id, data)
            .pipe(response => response);
    }
    aliderDemandeCredComite(data,id, url) {
        return this._httpClient.post(environment.apiUrl + url + '/' + id, data)
            .pipe(response => response);
    }
    validerDepot(url) {
        return this._httpClient.get(environment.apiUrl + url)
            .pipe(response => response);
    }

    bloquerDepot(id,data) {
        return this._httpClient.post(environment.apiUrl + 'depot-terme/debloquer/' + id, data)
            .pipe(response => response);
    }
    rejetDemande(id,data) {
        return this._httpClient.post(environment.apiUrl + 'demandes-credits/rejeter/' + id, data)
            .pipe(response => response);
    }
    fermerExercice() {
            return this._httpClient.get(environment.apiUrl + 'fermer-exercice',{} )
            .pipe(response => response);
    }
    detailExercice(data) {
            return this._httpClient.get(environment.apiUrl + 'detail-exercice/' + data,{} )
            .pipe(response => response);
    }
    rejetVirementPerm(id,data) {
        return this._httpClient.post(environment.apiUrl + 'virements-permanents/rejeter/' + id, data)
            .pipe(response => response);
    }
    validerAvance(id,data) {
        return this._httpClient.post(environment.apiUrl + 'depot-terme/avance/' + id, data)
            .pipe(response => response);
    }

    bloquerCompte(id) {
        return this._httpClient.get(environment.apiUrl + 'compte-bloquer' + '/' + id)
            .pipe(response => response);
    }
    bloquerDebloquerCompte(type,id) {
        let url = type=='bloquer' ? 'compte-bloquer' : 'compte-debloquer'
        return this._httpClient.get(environment.apiUrl + url + '/' + id)
            .pipe(response => response);
    }

    valider(data) {
        return this._httpClient.post(environment.apiUrl + 'remboursement-anticiper', data)
            .pipe(response => response);
    }

    lock(compte) {
        return this._httpClient.put(environment.apiUrl + 'compte-bloquer/' + compte?.id, compte).pipe(
            switchMap((response: any) =>
                // Return a new observable with the response
                of(response)
            )
        );
    }
    locked(url,compte) {
        return this._httpClient.put(environment.apiUrl + url+'/' + compte?.id, compte).pipe(
            switchMap((response: any) =>
                // Return a new observable with the response
                of(response)
            )
        );
    }



    financer(item, id, url): Observable<any[]> {
        return this._httpClient.post(environment.apiUrl + url + '/' + id, item).pipe(
            switchMap((response: any) => of(response))
        );
    }

    fermetureInstitution(url, id): Observable<any> {
        return this._httpClient.get(environment.apiUrl + url + id).pipe(
            switchMap((response: any) => of(response))
        );
    }
    ouvFermetureAgence(url, id): Observable<any> {
        return this._httpClient.get(environment.apiUrl + url + id).pipe(
            switchMap((response: any) => of(response))
        );
    }

    ouvertureInstitution(url, id, data): Observable<any> {
        return this._httpClient.post(environment.apiUrl + url + id, data).pipe(
            switchMap((response: any) => of(response))
        );
    }

    getTransactionJour(id, url) {
        return this._httpClient.get(environment.apiUrl + url + id).pipe(response => response);
    }

    getAllTransaction(url) {
        return this._httpClient.get(environment.apiUrl + url).pipe(response => response);
    }

    getAllTransactions(url, offset, max, data): Observable<any> {
        return this._httpClient.get(environment.apiUrl + url + '&max=' + max + '&offset=' + offset + '&order=desc', data).pipe(
            switchMap((response: any) => of(response))
        );
    }

    get accessToken(): string {
        return this.decriptDataToLocalStorage('CD-@--7') ?? '';
    }

    encriptDataToLocalStorage(key, value) {
        const data = crypto.AES.encrypt(JSON.stringify(value), this.salt).toString();
        localStorage.setItem(key, data);
    }

    decriptDataToLocalStorage(key) {
        const crypteData = localStorage.getItem(key);
        if (!crypteData)
            return null;
        const donnees = crypto.AES.decrypt(crypteData, this.salt);
        return JSON.parse(donnees.toString(crypto.enc.Utf8));
    }

    get salt() {
        return environment.ENCRYPT_SALT;
    }

    logout(url) {

        return this._httpClient.get<any[]>(environment.apiUrl + url).pipe(
            tap((response) => {
                this._modelLists.next(response);

            })
        );
    }


    /**
     * Get
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */

    /**
     * Update the avatar of the given contact
     *
     * @param id
     * @param avatar
     */
}
