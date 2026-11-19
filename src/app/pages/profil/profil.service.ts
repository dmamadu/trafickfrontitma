import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { User } from "src/app/store/Authentication/auth.models";
import { environment } from "src/environments/environment";

export interface ProfilUpdate {
  contact: string | null;
  locality: string | null;
  imageUrl: string | null;
}

export interface Connexion {
  id: number;
  type: "CONNEXION_REUSSIE" | "CONNEXION_ECHEC" | string;
  details: string;
  date: string;
}

export interface ConnexionsPage {
  items: Connexion[];
  total: number;
  page: number;
  size: number;
}

export interface MonProjet {
  id: number;
  libelle: string;
  description?: string;
  status?: string;
  imageUrl?: string;
  colors?: string;
  roles: string[];
}

interface ApiResponse<T> {
  responseCode: number;
  message: string;
  data: T;
}

/** Appels de la page « Mon profil » : toujours sur le compte connecté (routes /me du back). */
@Injectable({ providedIn: "root" })
export class ProfilService {
  private readonly url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMe(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.url}me`).pipe(map((r) => r.data));
  }

  updateMe(payload: ProfilUpdate): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.url}me`, payload).pipe(map((r) => r.data));
  }

  getConnexions(page: number, size: number): Observable<ConnexionsPage> {
    const params = new HttpParams().set("page", page).set("size", size);
    return this.http
      .get<ApiResponse<ConnexionsPage>>(`${this.url}me/connexions`, { params })
      .pipe(map((r) => r.data));
  }

  getProjets(): Observable<MonProjet[]> {
    return this.http.get<ApiResponse<MonProjet[]>>(`${this.url}me/projets`).pipe(map((r) => r.data ?? []));
  }

  /** Envoie la photo dans MinIO et renvoie le nom du fichier stocké. */
  uploadPhoto(file: File): Observable<string> {
    const formData = new FormData();
    formData.append("file", file);
    return this.http
      .post<{ code: number; message: string; fileName: string }>(`${this.url}fileMinios/upload`, formData)
      .pipe(map((r) => r.fileName));
  }
}
