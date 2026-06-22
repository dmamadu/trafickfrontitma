import { Component, OnInit, OnDestroy, Output, EventEmitter, Inject } from "@angular/core";
import { Router } from "@angular/router";
import { DOCUMENT } from "@angular/common";
import { AuthenticationService } from "../../core/services/auth.service";
import { CookieService } from "ngx-cookie-service";
import { LanguageService } from "../../core/services/language.service";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { Subject } from "rxjs";
import { takeUntil, take } from "rxjs/operators";
import { changesLayout } from "src/app/store/layouts/layout.actions";
import { getLayoutMode } from "src/app/store/layouts/layout.selector";
import { RootReducerState } from "src/app/store";
import { Auth } from "src/app/store/Authentication/auth.models";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ChangePasswordComponent } from "src/app/account/auth/change-password/change-password.component";
import { MyProfileComponent } from "src/app/account/auth/my-profile/my-profile.component";
import { LocalService } from "src/app/core/services/local.service";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.scss"],
})
export class TopbarComponent implements OnInit, OnDestroy {
  element: any;
  cookieValue: string;
  flagvalue: string;
  countryName: string;
  valueset: string;
  theme: string;
  user: Auth;
  userName: string = "";
  userRole: string = "";
  myImage: string;
  openMobileMenu: boolean;

  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();

  private destroy$ = new Subject<void>();

  listLang = [
    { text: "English", flag: "assets/images/flags/us.jpg", lang: "en" },
    { text: "Spanish", flag: "assets/images/flags/spain.jpg", lang: "es" },
    { text: "German", flag: "assets/images/flags/germany.jpg", lang: "de" },
    { text: "Italian", flag: "assets/images/flags/italy.jpg", lang: "it" },
    { text: "Russian", flag: "assets/images/flags/russia.jpg", lang: "ru" },
  ];

  constructor(
    @Inject(DOCUMENT) private document: any,
    private router: Router,
    private authService: AuthenticationService,
    public languageService: LanguageService,
    private snackbar: SnackBarService,
    public translate: TranslateService,
    public _cookiesService: CookieService,
    private _matDialog: MatDialog,
    private localService: LocalService,
    public store: Store<RootReducerState>
  ) {}

  ngOnInit() {
    if (this.authService.currentUser()) {
      this.user = this.authService.currentUser();
      if (this.user?.user?.image) {
        this.myImage = `data:${this.user.user.image.type};base64,${this.user.user.image.image}`;
      } else {
        this.myImage = "assets/images/user.png";
      }
    }

    const storedUser = this.localService.getDataJson("user");
    if (storedUser) {
      this.userName = `${storedUser.firstname || ""} ${storedUser.lastname || ""}`.trim();
      this.userRole = storedUser.role?.[0]?.name || "";
    }

    this.store.select("layout").pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.theme = data.DATA_LAYOUT;
    });

    this.openMobileMenu = false;
    this.element = document.documentElement;

    this.cookieValue = this._cookiesService.get("lang");
    const val = this.listLang.filter((x) => x.lang === this.cookieValue);
    this.countryName = val.map((element) => element.text)[0];
    if (val.length === 0) {
      this.valueset = "assets/images/flags/us.jpg";
    } else {
      this.flagvalue = val.map((element) => element.flag)[0];
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
  }

  toggleRightSidebar() {
    this.settingsButtonClicked.emit();
  }

  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  logout() {
    this.snackbar
      .showConfirmation("Voulez-vous vraiment vous déconnecter ?")
      .then((result) => {
        if (result["value"] == true) {
          this.authService.logout();
          this.router.navigate(["/auth/login"]);
        }
      });
  }

  changePassword(): void {
    this._matDialog.open(ChangePasswordComponent, {});
  }

  openProfile(): void {
    this._matDialog.open(MyProfileComponent, { width: "400px" });
  }

  changeLayout(layoutMode: string) {
    this.store.dispatch(changesLayout({ layoutMode }));
    this.store.select(getLayoutMode).pipe(take(1)).subscribe((layout) => {
      document.documentElement.setAttribute("data-layout", layout);
    });
  }

  fullscreen() {
    document.body.classList.toggle("fullscreen-enable");
    if (
      !document.fullscreenElement &&
      !this.element.mozFullScreenElement &&
      !this.element.webkitFullscreenElement
    ) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        this.element.mozRequestFullScreen();
      } else if (this.element.webkitRequestFullscreen) {
        this.element.webkitRequestFullscreen();
      } else if (this.element.msRequestFullscreen) {
        this.element.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        this.document.msExitFullscreen();
      }
    }
  }
}
