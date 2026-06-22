import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { EventService } from '../core/services/event.service';
import { RootReducerState } from '../store';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {

  dataLayout$: Observable<string>;
  private destroy$ = new Subject<void>();

  constructor(
    private eventService: EventService,
    private stores: Store<RootReducerState>
  ) {
    this.dataLayout$ = this.stores.select('layout').pipe(map(data => data.DATA_LAYOUT));
  }

  ngOnInit() {
    this.stores.select('layout').pipe(takeUntil(this.destroy$)).subscribe((data) => {
      document.body.setAttribute('data-bs-theme', data.LAYOUT_MODE);
      document.body.setAttribute('data-layout-size', data.LAYOUT_WIDTH);
      document.body.setAttribute('data-sidebar', data.SIDEBAR_MODE);
      document.body.setAttribute('data-topbar', data.TOPBAR_TYPE);

      switch (data.SIDEBAR_MODE) {
        case "light":
          document.body.setAttribute('data-sidebar', 'light');
          document.body.setAttribute('data-topbar', 'dark');
          document.body.removeAttribute('data-sidebar-size');
          document.body.removeAttribute('data-layout-size');
          document.body.removeAttribute('data-keep-enlarged');
          document.body.classList.remove('vertical-collpsed');
          document.body.removeAttribute('data-layout-scrollable');
          break;
        case "compact":
          document.body.setAttribute('data-sidebar-size', 'small');
          document.body.setAttribute('data-sidebar', 'dark');
          document.body.removeAttribute('data-topbar');
          document.body.removeAttribute('data-layout-size');
          document.body.removeAttribute('data-keep-enlarged');
          document.body.classList.remove('sidebar-enable');
          document.body.classList.remove('vertical-collpsed');
          document.body.removeAttribute('data-layout-scrollable');
          break;
        case "dark":
          document.body.setAttribute('data-sidebar', 'dark');
          document.body.removeAttribute('data-topbar');
          document.body.removeAttribute('data-layout-size');
          document.body.removeAttribute('data-keep-enlarged');
          document.body.removeAttribute('data-sidebar-size');
          document.body.classList.remove('sidebar-enable');
          document.body.classList.remove('vertical-collpsed');
          document.body.removeAttribute('data-layout-scrollable');
          break;
        case "icon":
          document.body.classList.add('vertical-collpsed');
          document.body.setAttribute('data-sidebar', 'dark');
          document.body.removeAttribute('data-layout-size');
          document.body.setAttribute('data-keep-enlarged', "true");
          document.body.removeAttribute('data-topbar');
          document.body.removeAttribute('data-layout-scrollable');
          break;
        case "colored":
          document.body.classList.remove('sidebar-enable');
          document.body.classList.remove('vertical-collpsed');
          document.body.setAttribute('data-sidebar', 'colored');
          document.body.removeAttribute('data-layout-size');
          document.body.removeAttribute('data-keep-enlarged');
          document.body.removeAttribute('data-topbar');
          document.body.removeAttribute('data-layout-scrollable');
          document.body.removeAttribute('data-sidebar-size');
          break;
        default:
          document.body.setAttribute('data-sidebar', 'dark');
          break;
      }

      switch (data.LAYOUT_WIDTH) {
        case "fluid":
          document.body.setAttribute("data-layout-size", "fluid");
          document.body.classList.remove("vertical-collpsed");
          document.body.removeAttribute("data-layout-scrollable");
          break;
        case "boxed":
          document.body.setAttribute("data-layout-size", "boxed");
          document.body.classList.add("vertical-collpsed");
          document.body.removeAttribute("data-layout-scrollable");
          break;
        case "scrollable":
          document.body.removeAttribute("data-layout-size");
          document.body.setAttribute("data-layout-scrollable", "true");
          document.body.setAttribute("data-layout-size", "fluid");
          document.body.classList.remove("right-bar-enabled", "vertical-collpsed");
          break;
        default:
          document.body.setAttribute("data-layout-size", "fluid");
          break;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
