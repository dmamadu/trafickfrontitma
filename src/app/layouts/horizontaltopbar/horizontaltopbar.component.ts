import { Component, OnInit, OnDestroy, AfterViewInit, Inject, ViewChild, Input, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import MetisMenu from 'metismenujs';
import { CookieService } from 'ngx-cookie-service';
import { LanguageService } from '../../core/services/language.service';
import { EventService } from '../../core/services/event.service';
import { AuthenticationService } from '../../core/services/auth.service';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MENU } from './menu';
import { MenuItem } from './menu.model';

@Component({
  selector: 'app-horizontaltopbar',
  templateUrl: './horizontaltopbar.component.html',
  styleUrls: ['./horizontaltopbar.component.scss']
})
export class HorizontaltopbarComponent implements OnInit, OnDestroy, AfterViewInit {
  menu: any;
  element: any;
  cookieValue: string;
  flagvalue: string;
  countryName: string;
  valueset: string;

  @ViewChild('componentRef') scrollRef;
  @Input() isCondensed = false;
  @ViewChild('sideMenu') sideMenu: ElementRef;

  menuItems: MenuItem[] = [];

  private destroy$ = new Subject<void>();

  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en' },
    { text: 'Spanish', flag: 'assets/images/flags/spain.jpg', lang: 'es' },
    { text: 'German', flag: 'assets/images/flags/germany.jpg', lang: 'de' },
    { text: 'Italian', flag: 'assets/images/flags/italy.jpg', lang: 'it' },
    { text: 'Russian', flag: 'assets/images/flags/russia.jpg', lang: 'ru' },
  ];

  constructor(
    @Inject(DOCUMENT) private document: any,
    private router: Router,
    private eventService: EventService,
    private authService: AuthenticationService,
    public languageService: LanguageService,
    public _cookiesService: CookieService
  ) {}

  ngOnInit(): void {
    this.element = document.documentElement;
    this.initialize();

    this.cookieValue = this._cookiesService.get('lang');
    const val = this.listLang.filter(x => x.lang === this.cookieValue);
    this.countryName = val.map(element => element.text)[0];
    if (val.length === 0) {
      this.valueset = 'assets/images/flags/us.jpg';
    } else {
      this.flagvalue = val.map(element => element.flag)[0];
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.activateMenu();
      this.menuItems.forEach(element => element.isCollapsed = false);
    });
  }

  ngAfterViewInit() {
    this._activateMenuDropdown();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges() {
    if (!this.isCondensed && this.sideMenu || this.isCondensed) {
      setTimeout(() => {
        this.menu = new MetisMenu(this.sideMenu.nativeElement);
      });
    } else if (this.menu) {
      this.menu.dispose();
    }
  }

  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  onMenuClick(parentIndex: number, item: any) {
    if (!parentIndex) {
      this.menuItems.forEach((element) => {
        element.isCollapsed = item === element ? !element.isCollapsed : false;
      });
    }
  }

  toggleMenubar() {
    const element = document.getElementById('topnav-menu-content');
    element?.classList.toggle('show');
  }

  onSettingsButtonClicked() {
    document.body.classList.toggle('right-bar-enabled');
  }

  initialize(): void {
    this.menuItems = MENU;
  }

  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  private _removeAllClass(className: string) {
    const els = document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }

  private activateMenu() {
    const links = document.getElementsByClassName('side-nav-link-ref');

    for (let i = 0; i < links.length; i++) {
      this._resetParent(links[i] as Element);
    }

    for (let i = 0; i < links.length; i++) {
      if (location.pathname === (links[i] as any)['pathname']) {
        this._activateParentChain(links[i] as Element);
        break;
      }
    }
  }

  private _resetParent(el: Element) {
    let current: Element | null = el.parentElement;
    this._removeAllClass('mm-active');
    this._removeAllClass('mm-show');
    while (current) {
      current.classList.remove('active');
      current = current.parentElement;
    }
    const menu = document.getElementById("topnav-menu-content");
    if (menu?.classList.contains('show')) {
      menu.classList.remove("show");
    }
  }

  private _activateParentChain(el: Element) {
    let current: Element | null = el.parentElement;
    while (current) {
      current.classList.add('active');
      current = current.parentElement;
    }
  }

  _activateMenuDropdown() {
    this._removeAllClass('mm-active');
    this._removeAllClass('mm-show');
    const links = document.getElementsByClassName('side-nav-link-ref');
    const paths: string[] = [];

    for (let i = 0; i < links.length; i++) {
      paths.push((links[i] as any)['pathname']);
    }

    let itemIndex = paths.indexOf(window.location.pathname);
    let menuItemEl: Element | null = null;

    if (itemIndex === -1) {
      const strIndex = window.location.pathname.lastIndexOf('/');
      const item = window.location.pathname.substr(0, strIndex);
      menuItemEl = links[paths.indexOf(item)] as Element;
    } else {
      menuItemEl = links[itemIndex] as Element;
    }

    if (menuItemEl) {
      menuItemEl.classList.add('active');
      this._activateParentChain(menuItemEl);
    }
  }

  fullscreen() {
    document.body.classList.toggle('fullscreen-enable');
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
