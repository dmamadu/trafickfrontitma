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
import { LocalService } from 'src/app/core/services/local.service';

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
    private localService: LocalService
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
    const user = this.localService.getDataJson("user");
    const userRole: string = user?.role?.[0]?.name;
    this.menuItems = this.filterMenuByRole(MENU, userRole);
  }

  private filterMenuByRole(items: MenuItem[], role: string): MenuItem[] {
    return items
      .filter(item => !item.roles || item.roles.includes(role))
      .map(item => ({
        ...item,
        subItems: item.subItems ? this.filterMenuByRole(item.subItems, role) : undefined,
      }));
  }

  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  trackByFn(index: number, item: MenuItem): number {
    return item.id ?? index;
  }
}
