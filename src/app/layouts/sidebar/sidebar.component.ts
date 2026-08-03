import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input, OnChanges, OnDestroy } from '@angular/core';
import MetisMenu from 'metismenujs';
import { EventService } from '../../core/services/event.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { TranslateService } from '@ngx-translate/core';
import { ServiceParent } from 'src/app/core/services/serviceParent';
import { PermissionService } from 'src/app/core/services/permission.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('componentRef') scrollRef;
  @Input() isCondensed = false;
  menu: any;

  menuItems: MenuItem[] = [];
  @ViewChild('sideMenu') sideMenu: ElementRef;

  private destroy$ = new Subject<void>();

  constructor(
    private eventService: EventService,
    private router: Router,
    public translate: TranslateService,
    private parentService: ServiceParent,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.initialize();
    this._scrollElement();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this._scrollElement();
    });
  }

  ngAfterViewInit() {
    this.menu = new MetisMenu(this.sideMenu.nativeElement);
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu(event: Event) {
    (event.currentTarget as HTMLElement).nextElementSibling?.classList.toggle('mm-show');
  }

  _scrollElement() {
    setTimeout(() => {
      const activeEls = document.getElementsByClassName('mm-active');
      if (activeEls.length > 0) {
        const currentPosition = (activeEls[0] as HTMLElement).offsetTop;
        if (currentPosition > 500 && this.scrollRef?.SimpleBar !== null) {
          this.scrollRef.SimpleBar.getScrollElement().scrollTop = currentPosition + 300;
        }
      }
    }, 300);
  }

  initialize(): void {
    this.menuItems = this.filterMenuByPermission(MENU);
  }

  /**
   * Un item sans `subItems` est gardé si sa `permission` est accordée (ou absente = visible par tous).
   * Un item avec `subItems` est gardé si au moins un de ses enfants reste visible après filtrage —
   * sa propre visibilité se déduit de celle de ses enfants, pas d'une permission qui lui serait propre.
   * Voir GESTION_PERMISSIONS_DOC.md §6.2.
   */
  private filterMenuByPermission(items: MenuItem[]): MenuItem[] {
    return items.reduce<MenuItem[]>((kept, item) => {
      if (item.subItems) {
        const keptChildren = this.filterMenuByPermission(item.subItems);
        if (keptChildren.length > 0) {
          kept.push({ ...item, subItems: keptChildren });
        }
        return kept;
      }
      if (!item.permission || this.permissionService.hasPermission(item.permission)) {
        kept.push(item);
      }
      return kept;
    }, []);
  }

  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  trackByFn(index: number, item: MenuItem): number {
    return item.id ?? index;
  }
}
