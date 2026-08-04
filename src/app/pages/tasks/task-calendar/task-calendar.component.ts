import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

// FullCalendar
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import frLocale from '@fullcalendar/core/locales/fr';

import { ServiceParent } from 'src/app/core/services/serviceParent';
import { CoreService } from 'src/app/shared/core/core.service';
import { SnackBarService } from 'src/app/shared/core/snackBar.service';
import { LocalService } from 'src/app/core/services/local.service';
import { CreatetaskComponent } from '../createtask/createtask.component';
import { DetailComponent } from '../detail/detail.component';
import { UIModule } from 'src/app/shared/ui/ui.module';

// Statut → couleur
const STATUT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'en-attente': { bg: '#FFF3CD', border: '#F59E0B', text: '#92400E' },
  'en-cours':   { bg: '#DBEAFE', border: '#3B82F6', text: '#1E3A8A' },
  'approuve':   { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
  'complete':   { bg: '#EDE9FE', border: '#8B5CF6', text: '#4C1D95' },
};

const STATUT_LABELS: Record<string, string> = {
  'en-attente': 'En attente',
  'en-cours':   'En cours',
  'approuve':   'Approuvé',
  'complete':   'Complété',
};

@Component({
  selector: 'app-task-calendar',
  templateUrl: './task-calendar.component.html',
  styleUrls: ['./task-calendar.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatBadgeModule,
    UIModule,
  ],
})
export class TaskCalendarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ─── State ────────────────────────────────────────────────────────────────
  loadData = false;
  currentProjectId: any;
  tasks: any[] = [];
  url = 'taches';
  pageSize = 500;
  offset = 0;

  // Stats rapides
  stats = { total: 0, enAttente: 0, enCours: 0, complete: 0 };

  // Vue active
  activeView: 'dayGridMonth' | 'timeGridWeek' | 'listWeek' = 'dayGridMonth';

  // ─── FullCalendar ─────────────────────────────────────────────────────────
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    locale: frLocale,
    initialView: 'dayGridMonth',
    headerToolbar: false, // on gère la toolbar custom
    height: 'auto',
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: 3,
    navLinks: true,
    weekends: true,
    nowIndicator: true,
    businessHours: { daysOfWeek: [1, 2, 3, 4, 5] },
    events: [],

    // Callbacks
    select: (arg) => this.handleDateSelect(arg),
    eventClick: (arg) => this.handleEventClick(arg),
    eventDrop: (arg) => this.handleEventDrop(arg),
    eventResize: (arg) => this.handleEventResize(arg),

    // Rendu personnalisé des événements
    eventContent: (arg) => this.renderEventContent(arg),

    // Affichage "more"
    moreLinkContent: (arg) => `+${arg.num} tâches`,
  };

  // Référence au composant FullCalendar pour la navigation
  @ViewChild('calendar') calendarComponent: any;

  constructor(
    private parentService: ServiceParent,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private localService: LocalService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
  ) {
    this.currentProjectId = this.localService.getData('ProjectId');
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Chargement ───────────────────────────────────────────────────────────
  loadTasks(): void {
    if (!this.currentProjectId) {
      this.showProjectError();
      return;
    }
    this.loadData = true;
    this.parentService
      .list(this.url, this.pageSize, this.offset, this.currentProjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.loadData = false;
          if (data?.responseCode === 200) {
            this.tasks = data.data ?? [];
            this.updateCalendarEvents();
            this.computeStats();
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.loadData = false;
          console.error(err);
          this.cdr.markForCheck();
        },
      });
  }

  // ─── Conversion tâches → events FullCalendar ─────────────────────────────
  private taskToEvent(task: any) {
    const colors = STATUT_COLORS[task.statut] ?? { bg: '#F3F4F6', border: '#9CA3AF', text: '#374151' };
    return {
      id: String(task.id),
      title: task.libelle,
      start: task.dateDebut,
      end: task.dateFin,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      textColor: colors.text,
      extendedProps: { task },
    };
  }

  private updateCalendarEvents(): void {
    const events = this.tasks.map((t) => this.taskToEvent(t));
    this.calendarOptions = { ...this.calendarOptions, events };
  }

  private computeStats(): void {
    this.stats = {
      total: this.tasks.length,
      enAttente: this.tasks.filter((t) => t.statut === 'en-attente').length,
      enCours: this.tasks.filter((t) => t.statut === 'en-cours').length,
      complete: this.tasks.filter((t) => t.statut === 'complete').length,
    };
  }

  // ─── Rendu custom événements ──────────────────────────────────────────────
  renderEventContent(arg: any) {
    const task = arg.event.extendedProps?.task;
    const assignes = task?.utilisateurs ?? [];
    const initials = assignes
      .slice(0, 2)
      .map((u: any) => (u.lastname?.[0] ?? '?').toUpperCase())
      .join('');

    return {
      html: `
        <div class="fc-event-inner" style="overflow:hidden; padding:2px 4px;">
          <div style="font-weight:600; font-size:0.75rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${arg.event.title}
          </div>
          ${assignes.length > 0
            ? `<div style="font-size:0.65rem; opacity:0.8;">${initials} ${assignes.length > 2 ? `+${assignes.length - 2}` : ''}</div>`
            : ''}
        </div>`,
    };
  }

  // ─── Interactions ─────────────────────────────────────────────────────────
  handleDateSelect(arg: DateSelectArg): void {
    if (!this.currentProjectId) { this.showProjectError(); return; }

    this.snackbar.openModal(
      CreatetaskComponent,
      '45rem',
      'new',
      'auto',
      this.tasks,
      '',
      () => this.loadTasks(),
      // Pré-remplir les dates sélectionnées
    //   {
    //     prefillDateDebut: arg.startStr,
    //     prefillDateFin: arg.endStr,
    //   }
    );

    // Désélection visuelle
    if (this.calendarComponent) {
      this.calendarComponent.getApi().unselect();
    }
  }

  handleEventClick(arg: EventClickArg): void {
    const task = arg.event.extendedProps?.task;
    this.snackbar.openModal(
      DetailComponent,
      '45rem',
      '',
      '35rem',
      task,
      '',
      () => this.loadTasks()
    );
  }

  handleEventDrop(arg: EventDropArg): void {
    const task = arg.event.extendedProps?.task;
    const updatedTask = {
      ...task,
      dateDebut: arg.event.startStr,
      dateFin: arg.event.endStr ?? arg.event.startStr,
    };
    this.coreService.updateItemWithProject(updatedTask, task.id, this.url, this.currentProjectId).subscribe({
      next: () => {
        this.toastr.success('Tâche déplacée avec succès', '', { timeOut: 2000 });
        this.loadTasks();
      },
      error: (err) => {
        arg.revert();
        this.snackbar.showErrors(err);
      },
    });
  }

  handleEventResize(arg: any): void {
    this.handleEventDrop(arg); // même logique
  }

  // ─── Navigation / toolbar custom ─────────────────────────────────────────
  prev(): void { this.calendarComponent?.getApi().prev(); }
  next(): void { this.calendarComponent?.getApi().next(); }
  today(): void { this.calendarComponent?.getApi().today(); }

  setView(view: 'dayGridMonth' | 'timeGridWeek' | 'listWeek'): void {
    this.activeView = view;
    this.calendarComponent?.getApi().changeView(view);
  }

  get currentTitle(): string {
    return this.calendarComponent?.getApi().view?.title ?? '';
  }

  // ─── Actions rapides ──────────────────────────────────────────────────────
  addTask(): void {
    if (!this.currentProjectId) { this.showProjectError(); return; }
    this.snackbar.openModal(CreatetaskComponent, '45rem', 'new', 'auto', this.tasks, '', () => this.loadTasks());
  }

  editTask(task: any): void {
    this.snackbar.openModal(CreatetaskComponent, '40rem', 'edit', '', task, '', () => this.loadTasks());
  }

  deleteTask(task: any): void {
    this.snackbar.showConfirmation('Voulez-vous vraiment supprimer cette tâche ?').then((result) => {
      if (result?.value) {
        this.coreService.deleteItemWithProject(task.id, this.url, this.currentProjectId).subscribe({
          next: () => {
            this.toastr.success('Tâche supprimée avec succès');
            this.loadTasks();
          },
          error: (err) => this.snackbar.showErrors(err),
        });
      }
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  getStatutLabel(statut: string): string {
    return STATUT_LABELS[statut] ?? statut;
  }

  getStatutColors(statut: string) {
    return STATUT_COLORS[statut] ?? { bg: '#F3F4F6', border: '#9CA3AF', text: '#374151' };
  }

  private showProjectError(): void {
    this.toastr.error(
      'Vous devez être connecté en tant que maître d\'ouvrage responsable d\'un projet.',
      'Action non autorisée',
      { timeOut: 8000, progressBar: true, closeButton: true }
    );
  }
}