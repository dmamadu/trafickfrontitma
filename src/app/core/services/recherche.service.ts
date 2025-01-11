import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import { CoreService } from 'src/app/shared/core/core.service';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})
export class RechercheService {

    private _modelLists: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private coreService: CoreService) {
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    doRechercher(data, url, type?) {
        if (!type) {
            if (data.isGlobal) {
                const params = new HttpParams()
                    .set('isGlobal', data.isGlobal)
                    .set('searchQuery', data.searchQuery);
                return this._httpClient.get(environment.apiUrl + url, {params})
                    .pipe(response => response);
            }
            else {
                const keys = Object.keys(data.searchQuery);
                let newMap = {};
                for (const key of keys) {
                    if (data.searchQuery[key] == '') {
                        delete data.searchQuery[key];
                    } else {
                        newMap = {...newMap, ...{[key]: data.searchQuery[key]}};
                    }
                }
                return this._httpClient.get(environment.apiUrl + url + '?isGlobal=' + data.isGlobal + '&searchQuery=' + encodeURIComponent(JSON.stringify(newMap)))
                    .pipe(response => response);
            }
        } else {
            if (data.isGlobal) {
                const params = new HttpParams()
                    .set('' + type.name + '', type.value)
                    .set('isGlobal', data.isGlobal)
                    .set('searchQuery', data.searchQuery);
                return this._httpClient.get(environment.apiUrl + url, {params})
                    .pipe(response => response);
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
                return this._httpClient.get(environment.apiUrl + url + '?isGlobal=' + data.isGlobal + '&' + type.label + '=' + type.name + '&searchQuery=' + encodeURIComponent(JSON.stringify(newMap)))
                    .pipe(response => response);
            }
        }
    }


    addItem(item, url): Observable<any[]> {
        return this._httpClient.post(environment.apiUrl + url, item).pipe(
            switchMap((response: any) => of(response))
        );
    }

    updateItem(item, id, url): Observable<any[]> {
        return this._httpClient.put(environment.apiUrl + url + '/' + id, item).pipe(
            switchMap((response: any) => of(response))
        );
    }

    list(url, offset, max): Observable<any[]> {

        return this._httpClient.get<any[]>(environment.apiUrl + url + '?max=' + max + '&offset=' + offset + '&order=desc').pipe(
            tap((response) => {
                this._modelLists.next(response);

            })
        );
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


    deleteItem(item, url) {
        return this._httpClient.delete(environment.apiUrl + url + '/' + item, item)
            .pipe(response => response);
    }


    getElement(id, url) {
        return this._httpClient.get(environment.apiUrl + url + '/' + id).pipe(response => response);
    }
    getcompense(id, url) {
        return this._httpClient.get(environment.apiUrl + url + '/' + id).pipe(response => response);
    }

    cloturerCompte(compte) {
        return this._httpClient.get(environment.apiUrl + 'compte-cloturer' + '/' + compte.compteId + '/' + compte.abandonFrais)
            .pipe(response => response);
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

    bloquerCompte(id) {
        return this._httpClient.get(environment.apiUrl + 'compte-bloquer' + '/' + id)
            .pipe(response => response);
    }

    valider(data) {
        return this._httpClient.post(environment.apiUrl + 'remboursement-anticipe', data)
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

    financer(item, id, url): Observable<any[]> {
        return this._httpClient.post(environment.apiUrl + url + '/' + id, item).pipe(
            switchMap((response: any) => of(response))
        );
    }


    encriptDataToLocalStorage(key, value) {
        this.coreService.encriptDataToLocalStorage(key, value);
    }

    decriptDataToLocalStorage(key) {
        return this.coreService.decriptDataToLocalStorage(key);
    }


}
