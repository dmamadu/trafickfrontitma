import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { Router } from '@angular/router';
import { AuthenticationService } from './auth.service';
import { User } from 'src/app/store/Authentication/auth.models';
@Injectable({
  providedIn: 'root',
})
export class LocalService {
  constructor(private authService: AuthenticationService, private router: Router) {}
  key = '"((-"-(@-èèé("""" +Gs1_';
  public saveData(key: string, value: string) {
    sessionStorage.setItem(key, this.encrypt(value));
  }

  public getData(key: string) {
    let data = sessionStorage.getItem(key) || '';
    return this.decrypt(data);
  }


  public getDataItem(key: string) {
    let data = sessionStorage.getItem(key) || '';
    return this.decryptItem(data);
  }
  public removeData(key: string) {
    sessionStorage.removeItem(key);
  }

  public clearData() {
    sessionStorage.clear();
  }

  private encrypt(txt: string): string {
    return CryptoJS.AES.encrypt(txt, this.key).toString();
  }

  private decrypt(txtToDecrypt: string) {
    return CryptoJS.AES.decrypt(txtToDecrypt, this.key).toString(
      CryptoJS.enc.Utf8
    );
  }

  public saveDataJson(key: string, value: User) {
    try {
    sessionStorage.setItem(key, this.encryptObject(value));
    } catch (e: any) {
      console.error('Erreur lors du stockage des données dans le stockage local :', e.message);
    }
  }

  // public getDataJson(key: string) {
  //   let data = sessionStorage.getItem(key) || '';
  //   return this.decryptObject(data);
  // }
  public getDataJson(key: string) {
    let data = sessionStorage.getItem(key) || '';
    if (!data) {
      console.warn(`No data found in sessionStorage for key: ${key}`);
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
    let data = sessionStorage.getItem(key) || '';
    return this.decryptItem(data);
  }

  public encryptObject(obj: User): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  public encryptItem(obj: number): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }
  // public decryptObject(txtToDecrypt: string): User | null {
  //   try {
  //     const decryptedText = this.decrypt(txtToDecrypt);
  //     const jsonObject = JSON.parse(decryptedText);
  //     return jsonObject;
  //   } catch (error) {
  //     console.error('Error decrypting and parsing object:', error);
  //     //this.authService.logout();
  //     sessionStorage.clear();
  //     this.router.navigate(['/login']);
  //     return null;
  //   }
  // }
  private decryptObject(encryptedData: string): any {
    try {
      // Log the encrypted data
      //console.log('Encrypted data:', encryptedData);

      const decryptedData = this.decrypt(encryptedData); // Assurez-vous que cette méthode fonctionne correctement

      // Log the decrypted data
     /// console.log('Decrypted data:', decryptedData);

      const parsedData = JSON.parse(decryptedData); // C'est ici que l'erreur se produit
      return parsedData;
    } catch (error) {
      console.error('Error decrypting and parsing object:', error);
      return null;
    }
  }
  public decryptItem(txtToDecrypt: string): number | null {
    try {
      const decryptedText = this.decrypt(txtToDecrypt);
      //const jsonObject = JSON.parse(decryptedText);
      return +decryptedText;
    } catch (error) {
      console.error('Error decrypting and parsing object:', error);
      //this.authService.logout();
      sessionStorage.clear();
      this.router.navigate(['/login']);
      return null;
    }
  }
}
