import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { EventService } from '../../core/services/event.service';
import { LayoutState, initialState } from 'src/app/store/layouts/layouts.reducer';
import { Store } from '@ngrx/store';
import { changeLayoutWidth, changeMode, changeSidebarMode, changesLayout } from 'src/app/store/layouts/layout.actions';
import { getLayoutMode, getLayoutWidth, getsidebar } from 'src/app/store/layouts/layout.selector';
import { RootReducerState } from 'src/app/store';

@Component({
  selector: 'app-rightsidebar',
  templateUrl: './rightsidebar.component.html',
  styleUrls: ['./rightsidebar.component.scss']
})
export class RightsidebarComponent implements OnInit, OnDestroy {

  isVisible: string;
  attribute: string;
  mode: string;
  topbar: string;
  theme: string;
  layoutSize: string;
  sidebar: string;
  initialAppState!: LayoutState;

  private destroy$ = new Subject<void>();

  constructor(private eventService: EventService, public store: Store<RootReducerState>) {}

  ngOnInit() {
    this.initialAppState = initialState;

    this.store.select('layout').pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.mode = data.LAYOUT_MODE;
      this.theme = data.DATA_LAYOUT;
      this.attribute = data.DATA_LAYOUT;
      this.topbar = data.TOPBAR_TYPE;
      this.sidebar = data.SIDEBAR_MODE;
      this.layoutSize = data.LAYOUT_WIDTH;
    });

    if (!this.attribute) {
      this.attribute = document.body.getAttribute('data-layout') || 'vertical';
    }
    const vertical = document.getElementById('is-layout');
    if (vertical != null) {
      vertical.setAttribute('checked', 'true');
      if (this.attribute === 'horizontal') {
        vertical.removeAttribute('checked');
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public hide() {
    document.body.classList.remove('right-bar-enabled');
  }

  changeTopbar(topbar: string) {
    this.topbar = topbar;
    this.eventService.broadcast('changeTopbar', topbar);
  }

  toggleLayout() {
    this.theme = this.theme === 'vertical' ? 'horizontal' : 'vertical';
    this.changeLayout(this.theme);
  }

  changeLayout(layoutMode: string) {
    this.store.dispatch(changesLayout({ layoutMode }));
    this.store.select(getLayoutMode).pipe(take(1)).subscribe((layout) => {
      document.documentElement.setAttribute('data-layout', layout);
    });
  }

  changeWidth(layoutWidth: any) {
    this.store.dispatch(changeLayoutWidth({ layoutWidth }));
    this.store.select(getLayoutWidth).pipe(take(1)).subscribe((lw) => {
      document.documentElement.setAttribute('data-layout-size', lw);
    });
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  }

  changeSidebartype(sidebarMode: any) {
    this.store.dispatch(changeSidebarMode({ sidebarMode }));
    this.store.select(getsidebar).pipe(take(1)).subscribe((sm) => {
      document.documentElement.setAttribute('data-sidebar', sm);
    });
  }

  changeMode(mode: string) {
    this.store.dispatch(changeMode({ mode }));
    this.store.select(getLayoutMode).pipe(take(1)).subscribe((m) => {
      document.documentElement.setAttribute('data-bs-theme', m);
    });
    document.documentElement.setAttribute('data-topbar', mode === 'light' ? 'dark' : mode);
  }
}
