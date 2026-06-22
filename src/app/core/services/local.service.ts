import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/store/Authentication/auth.models';

@Injectable({
  providedIn: 'root',
})
export class LocalService {
  private readonly key = environment.ENCRYPT_KEY || '"((-"-(@-èèé("""" +Gs1_';

  constructor(private router: Router) {}

  public saveData(key: string, value: string) {
    sessionStorage.setItem(key, this.encrypt(value));
  }

  public getData(key: string) {
    const data = sessionStorage.getItem(key) || '';
    return this.decrypt(data);
  }

  public getDataItem(key: string) {
    const data = sessionStorage.getItem(key) || '';
    return this.decryptItem(data);
  }

  public removeData(key: string) {
    sessionStorage.removeItem(key);
  }

  public clearData() {
    sessionStorage.clear();
  }

  public saveDataJson(key: string, value: User) {
    try {
      sessionStorage.setItem(key, this.encryptObject(value));
    } catch (e: any) {
      console.error('Erreur lors du stockage des données :', e.message);
    }
  }

  public getDataJson(key: string) {
    const data = sessionStorage.getItem(key) || '';
    if (!data) {
      return null;
    }
    try {
      return this.decryptObject(data);
    } catch (error) {
      console.error(`Error decrypting data for key: ${key}`, error);
      return null;
    }
  }

  public saveItem(key: string, value: number) {
    sessionStorage.setItem(key, this.encryptItem(value));
  }

  public getItem(key: string) {
    const data = sessionStorage.getItem(key) || '';
    return this.decryptItem(data);
  }

  public encryptObject(obj: User): string {
    return this.encrypt(JSON.stringify(obj));
  }

  public encryptItem(obj: number): string {
    return this.encrypt(JSON.stringify(obj));
  }

  private decryptObject(encryptedData: string): any {
    try {
      const decryptedData = this.decrypt(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error decrypting and parsing object:', error);
      return null;
    }
  }

  public decryptItem(txtToDecrypt: string): number | null {
    try {
      const decryptedText = this.decrypt(txtToDecrypt);
      return +decryptedText;
    } catch (error) {
      console.error('Error decrypting item:', error);
      sessionStorage.clear();
      this.router.navigate(['/login']);
      return null;
    }
  }

  private encrypt(txt: string): string {
    return CryptoJS.AES.encrypt(txt, this.key).toString();
  }

  private decrypt(txtToDecrypt: string): string {
    return CryptoJS.AES.decrypt(txtToDecrypt, this.key).toString(CryptoJS.enc.Utf8);
  }
}
