import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import { Message } from 'postcss';
import { environment } from 'src/environments/environment';

// import {Compte, Message} from './message.model';

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    // Private
    private _messages: BehaviorSubject<Message[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }


    /**
     * modifier Roles
     */

    templateConsentementClient(data: any) {
        return this._httpClient.post(environment.apiUrl + 'templates-consentement/edition', data);
    }
 templateContratClient(data: any) {
        return this._httpClient.post(environment.apiUrl + 'depot-terme/edition', data);
    }

    getTemplateConsentement() {
        return this._httpClient.get(environment.apiUrl + 'templates-consentement');
    }

    modifierTemplateConsentement(data: any) {
        return this._httpClient.put(environment.apiUrl + 'templates-consentement1/' + data.id, data);
    }



    saveOrUpdateFile(data: any) {
        if (data['id']) {
            return this._httpClient.put(environment.apiUrl + 'documents/' + data['id'], data).pipe(response => response);
        } else {
            return this._httpClient.post(environment.apiUrl + 'documents', data).pipe(response => response);
        }

    }

    /**
     * Get compte
     */
    allMessages(): Observable<Message[]> {
        return this._httpClient.get<Message[]>(environment.apicomURL + 'messages' + '?max=' + environment.max + '&offset=' + environment.offset).pipe(
            tap((messages) => {
                this._messages.next(messages);
            })
        );
    }


    // partie type compte

    envoiMail(data: any) {
        return this._httpClient.post(environment.apicomURL + 'messages/group', data);
    }

    getElementById(id, url) {
      return this._httpClient.get(environment.apiUrl + url + '/' + id).pipe(response => response);
  }

}
