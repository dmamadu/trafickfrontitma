import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input, OnChanges } from '@angular/core';
import MetisMenu from 'metismenujs';
import { EventService } from '../../core/services/event.service';
import { Router, NavigationEnd } from '@angular/router';

import { HttpClient } from '@angular/common/http';

import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { TranslateService } from '@ngx-translate/core';
import { ServiceParent } from 'src/app/core/services/serviceParent';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

/**
 * Sidebar component
 */
export class SidebarComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('componentRef') scrollRef;
  @Input() isCondensed = false;
  menu: any;
  data: any;

  menuItems: MenuItem[] = [];
  @ViewChild('sideMenu') sideMenu: ElementRef;
  datas: any;
  constructor(private eventService: EventService, private router: Router, public translate: TranslateService, private http: HttpClient, private parentService: ServiceParent) {
    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this._activateMenuDropdown();
        this._scrollElement();
      }
    });
  }

  ngOnInit() {
    this.initialize();
    this._scrollElement();
  }

  ngAfterViewInit() {
    this.menu = new MetisMenu(this.sideMenu.nativeElement);
    this._activateMenuDropdown();
  }

  toggleMenu(event) {
    event.currentTarget.nextElementSibling.classList.toggle('mm-show');
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
  _scrollElement() {
    setTimeout(() => {
      if (document.getElementsByClassName("mm-active").length > 0) {
        const currentPosition = document.getElementsByClassName("mm-active")[0]['offsetTop'];
        if (currentPosition > 500)
          if (this.scrollRef.SimpleBar !== null)
            this.scrollRef.SimpleBar.getScrollElement().scrollTop =
              currentPosition + 300;
      }
    }, 300);
  }

  /**
   * remove active and mm-active class
   */
  _removeAllClass(className) {
    const els = document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }

  /**
   * Activate the parent dropdown
   */
  _activateMenuDropdown() {
    // Réinitialiser toutes les classes 'mm-active' et 'mm-show'
    this._removeAllClass('mm-active');
    this._removeAllClass('mm-show');

    const links = document.getElementsByClassName('side-nav-link-ref');
    let menuItemEl = null;

    // Recueillir les chemins des liens du menu
    const paths = Array.from(links).map(link => link['pathname']);

    // Vérifier si l'élément correspondant à l'URL actuelle existe dans le tableau de chemins
    const itemIndex = paths.indexOf(window.location.pathname);

    if (itemIndex === -1) {
      // Si aucune correspondance exacte n'est trouvée, essayer avec le chemin parent
      const strIndex = window.location.pathname.lastIndexOf('/');
      const parentPath = window.location.pathname.substr(0, strIndex);
      menuItemEl = links[paths.indexOf(parentPath)];
    } else {
      // Trouver l'élément correspondant à l'URL actuelle
      menuItemEl = links[itemIndex];
    }

    if (menuItemEl) {
      // Ajouter la classe 'active' à l'élément correspondant
      menuItemEl.classList.add('active');

      let parentEl = menuItemEl.parentElement;

      // Activer les parents si nécessaire
      while (parentEl && parentEl.id !== 'side-menu') {
        parentEl.classList.add('mm-active');
        const parent2El = parentEl.closest('ul');

        if (parent2El) {
          parent2El.classList.add('mm-show');
          const parent3El = parent2El.closest('li');

          if (parent3El) {
            parent3El.classList.add('mm-active');
            const childAnchor = parent3El.querySelector('.has-arrow');
            const childDropdown = parent3El.querySelector('.has-dropdown');

            // Vérifier et activer les classes des enfants
            if (childAnchor) {
              childAnchor.classList.add('mm-active');
            }
            if (childDropdown) {
              childDropdown.classList.add('mm-active');
            }

            const parent4El = parent3El.closest('li');
            if (parent4El) {
              parent4El.classList.add('mm-show');
              const childAnchor2 = parent4El.querySelector('.is-parent');
              if (childAnchor2) {
                childAnchor2.classList.add('mm-active');
              }
            }
          }
        }

        parentEl = parentEl.parentElement;
      }
    }
  }


  /**
   * Initialize
   */
  initialize(): void {
    this.menuItems = MENU;
    //this.getCategorie();
  }


  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

}
