import { Component, OnInit, OnDestroy, Output, EventEmitter, Inject } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { DOCUMENT } from "@angular/common";
import { AuthenticationService } from "../../core/services/auth.service";
import { CookieService } from "ngx-cookie-service";
import { LanguageService } from "../../core/services/language.service";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { Subject } from "rxjs";
import { takeUntil, take, filter } from "rxjs/operators";
import { changesLayout } from "src/app/store/layouts/layout.actions";
import { getLayoutMode } from "src/app/store/layouts/layout.selector";
import { RootReducerState } from "src/app/store";
import { Auth } from "src/app/store/Authentication/auth.models";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { LocalService } from "src/app/core/services/local.service";
import { MatDialog } from "@angular/material/dialog";
import { ProjectService } from "src/app/core/services/project.service";
import { USER_PROFILE_UPDATED_EVENT, resolveUserImageUrl } from "src/app/shared/utils/user-image";

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
    public store: Store<RootReducerState>,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    if (this.authService.currentUser()) {
      this.user = this.authService.currentUser();
    }
    this.refreshUserHeader();
    this.refreshProjectSwitch();
    // La page « Mon profil » prévient quand la photo ou les coordonnées changent
    window.addEventListener(USER_PROFILE_UPDATED_EVENT, this.onProfileUpdated);
    // Le changement de projet redirige vers le tableau de bord : on rafraîchit alors la pastille projet
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe((e: NavigationEnd) => {
        this.refreshUserHeader();
        // Après création ou suppression d'un projet, le nombre de projets a pu changer
        if (e.urlAfterRedirects.startsWith("/projects")) this.refreshProjectSwitch();
      });

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
    window.removeEventListener(USER_PROFILE_UPDATED_EVENT, this.onProfileUpdated);
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
    // Chargé au clic pour ne pas embarquer Angular Material dans le bundle initial
    import("src/app/account/auth/change-password/change-password.component").then(({ ChangePasswordComponent }) =>
      this._matDialog.open(ChangePasswordComponent, {})
    );
  }

  openProfile(): void {
    this.router.navigate(["/profil"]);
  }

  private readonly onProfileUpdated = () => this.refreshUserHeader();

  /** Nom du projet actif, affiché dans la pastille de la barre du haut. */
  projectLabel = "";

  /**
   * Faux tant qu'il n'y a qu'un seul projet accessible : la pastille devient alors une simple
   * étiquette, sans menu de sélection (même règle qu'à la connexion).
   */
  canSwitchProject = false;

  private isAdminUser(): boolean {
    const roles: string[] = (this.localService.getDataJson("user")?.role ?? []).map((r: any) => r?.name);
    return roles.some((r) => r === "Super Admin" || r === "Admin");
  }

  /** Admin : tous les projets de la plateforme (projects/all). Autres : projets affectés au compte. */
  private refreshProjectSwitch(): void {
    if (!this.isAdminUser()) {
      this.canSwitchProject = (this.localService.getDataJson("user")?.projects?.length ?? 0) > 1;
      return;
    }
    this.projectService
      .all<any>("projects/all")
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => (this.canSwitchProject = (resp?.data?.length ?? 0) > 1),
        // En cas d'échec, on laisse la sélection accessible plutôt que de bloquer l'utilisateur
        error: () => (this.canSwitchProject = true),
      });
  }

  openProjectSwitcher(): void {
    if (!this.canSwitchProject) return;
    if (this.isAdminUser()) {
      import("src/app/account/auth/select-project-admin/select-project-admin.component").then(
        ({ SelectProjectAdminComponent }) => this._matDialog.open(SelectProjectAdminComponent)
      );
    } else {
      import("src/app/account/auth/select-project/select-project.component").then(({ SelectProjectComponent }) =>
        this._matDialog.open(SelectProjectComponent)
      );
    }
  }

  /** Nom, rôle et photo affichés dans la barre du haut (photo MinIO, puis ancienne image base64, puis défaut). */
  private refreshUserHeader(): void {
    this.projectLabel = this.localService.getData("libelleProject") || "";
    const storedUser = this.localService.getDataJson("user");
    if (storedUser) {
      this.userName = `${storedUser.firstname || ""} ${storedUser.lastname || ""}`.trim();
      this.userRole = storedUser.role?.[0]?.name || "";
    }
    if (storedUser?.imageUrl) {
      this.myImage = resolveUserImageUrl(storedUser.imageUrl);
    } else if (this.user?.user?.image) {
      this.myImage = `data:${this.user.user.image.type};base64,${this.user.user.image.image}`;
    } else {
      this.myImage = "assets/images/user.png";
    }
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
