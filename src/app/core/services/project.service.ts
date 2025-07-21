import { Injectable } from "@angular/core";
import { RootService } from "./root.service";
import { Observable } from "rxjs";
import { Image } from "src/app/shared/models/image.model";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ProjectService extends RootService {
  uploadFile(file: File, filename: string, idProd: number): Observable<any> {
    const imageFormData = new FormData();
    imageFormData.append("file", file, filename);
    const url = `${this.url + "/file/uplaodFilesProd/" + `${idProd}`}`;
    return this.http.post<any>(url, imageFormData);
  }

  uploadFichiers(fichier: any, projectId: number) {
    const body = {
      fichierUrl: fichier,
      // projectId: projectId
    };
    const url = `${this.url}/fichiers/ajout/${projectId}`;
    return this.http.post<any>(url, body);
  }

  saveNormeProjet(normeProjet: any, projectId: number) {
    const url = `${this.url}/normes/saveNorme/${projectId}`;
    return this.http.post<any>(url, normeProjet);
  }
  saveNormeProjet1(normeProjet: any[], projectId: number) {
    const url = `${this.url}/normes/update/${projectId}`;
    return this.http.post<any>(url, normeProjet);
  }

  updateNormeProjet(normeProjet: any, projectId: number) {
    const url = `${this.url}/normes/updateNorme/${projectId}`;
    return this.http.put<any>(url, normeProjet);
  }

  uploadFiles(
    files: File[],
    filenames: string[],
    idProd: number
  ): Observable<any[]> {
    const imageFormData = new FormData();

    for (let i = 0; i < files.length; i++) {
      imageFormData.append("files", files[i], filenames[i]);
    }

    const url = `${this.url}/file/update/${idProd}`;
    return this.http.post<any[]>(url, imageFormData);
  }

  getRencontreByProjectId(projectId: number): Observable<any> {
    const url = `${this.url}rencontres/project/${projectId}`;
    return this.http.get<any>(url);
  }

  // getStatsByProjectId(uri: string, projectId: number): Observable<any> {
  //   const url = `${this.url}${uri}/${projectId}`;
  //   return this.http.get<any>(url);
  // }
getStatsByProjectId(uri: string, projectId: number): Observable<any> {
    const url = `${this.url}${uri}/vulnerability-stats`;
    const params = new HttpParams().set('projectId', projectId.toString());
    return this.http.get<any>(url, { params });
}
getStatsCombineByProjectId(projectId: number): Observable<any> {
    const url = `${this.url}stats/combine`;
    const params = new HttpParams().set('projectId', projectId.toString());
    return this.http.get<any>(url, { params });
}
}
