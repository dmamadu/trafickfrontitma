import { Injectable, inject } from "@angular/core";

import { getFirebaseBackend } from "../../authUtils";
import { Auth, User } from "src/app/store/Authentication/auth.models";
import { from, map } from "rxjs";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { T } from "@fullcalendar/core/internal-common";
import { LocalService } from "./local.service";
import { TokenStorageService } from "./token-storage.service";

@Injectable({ providedIn: "root" })
export class AuthenticationService {
  user: User;
  url: string = environment.apiUrl;

  private http = inject(HttpClient);
  private localService = inject(LocalService);
   private  tokenStorageService=inject(TokenStorageService);
  constructor() {}

  /**
   * Returns the current user
   */
  public currentUser(): Auth | null {
    const userJSON = localStorage.getItem("currentUser");
    if (userJSON) {
      return JSON.parse(userJSON);
    } else {
      return null;
    }
  }

  /**
   * Performs the auth
   * @param email email of user
   * @param password password of user
   */
  // login(email: string, password: string) {
  //   return from(
  //     getFirebaseBackend()
  //       .loginUser(email, password)
  //       .pipe(
  //         map((user) => {
  //           return user;
  //         })
  //       )
  //   );
  // }
  // login(identifiants: any) {
  //   return this.http.post(this.url, identifiants);
  // }

  login(email: string, password: string) {
    return this.http
      .post<Auth>(`${this.url}users/login`, { email, password })
      .pipe(
        map((user) => {
          // login successful if there's a jwt token in the response
          if (user && user.token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem("currentUser", JSON.stringify(user));
            this.localService.saveItem("token", +user.token);
            this.localService.saveDataJson("user", user.user);
            //  this.currentUserSubject.next(user);
          }
          return user;
        })
      );
  }
  /**
   * Performs the register
   * @param email email
   * @param password password
   */
  register(user: User) {
    // return from(getFirebaseBackend().registerUser(user));

    return from(
      getFirebaseBackend()
        .registerUser(user)
        .then((response: any) => {
          const user = response;
          return user;
        })
    );
  }

  /**
   * Reset password
   * @param email email
   */
  resetPassword(email: string) {
    return this.http.post(`${this.url}/users/reset`, { email }).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  changePassword(newPassword: string, token: string) {
    return this.http
      .post(`${this.url}/users/reset-password`, { newPassword, token })
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /**
   * Logout the user
   */
  logout() {
    // logout the user
    localStorage.removeItem("currentUser");
  }
}
