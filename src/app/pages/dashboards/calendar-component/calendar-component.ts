import { Component, OnInit,Input, SimpleChanges } from '@angular/core';
import { CalendarOptions, EventApi, EventInput } from '@fullcalendar/core';
import { LocalService } from "src/app/core/services/local.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { FullCalendarModule } from '@fullcalendar/angular';
import { BrowserModule } from '@angular/platform-browser';

import dayGridPlugin from '@fullcalendar/daygrid'; // plugin pour dayGridMonth
import timeGridPlugin from '@fullcalendar/timegrid'; // plugin pour timeGridWeek/Day
import interactionPlugin from '@fullcalendar/interaction'; // plugin pour les interactions
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TaskDetailsModalComponent } from '../task-details-modal/task-details-modal.component';
import { SnackBarService } from 'src/app/shared/core/snackBar.service';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { AngularMaterialModule } from 'src/app/shared/angular-materiel-module/angular-materiel-module';


@Component({
  selector: 'app-calendar-component',
  standalone: true,
  imports: [FullCalendarModule,BrowserModule,CommonModule,
    MatDialogModule,AngularMaterialModule,
    MatNativeDateModule],
  templateUrl: './calendar-component.html',
  styleUrl: './calendar-component.css'
})
export class CalendarComponent  implements OnInit {
@Input() tasks: any[] ;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    // events: [
    //   { title: 'event 1', date: '2025-07-01' },
    //   { title: 'event 2', date: '2025-07-02' }
    // ],
    // eventClick: (info) => {
    //   // this.openTaskDetails(info.event);
    // }
  };

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.updateCalendarEvents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tasks) {
      this.updateCalendarEvents();
    }
  }

  private updateCalendarEvents(): void {
    if (this.tasks && this.tasks.length > 0) {
       this.calendarOptions.events = this.transformTasksToEvents(this.tasks);
    } else {
      this.calendarOptions.events = [];
    }
  }

  private transformTasksToEvents(tasks: any[]): EventInput[] {
    return tasks.map(task => ({
       id: task.id.toString(),
      start: task.dateDebut,
      date: task.dateDebut,
      title: `${task.libelle}`,
      extendedProps: {
        description: task.description,
        status: task.statut,
        users: task.utilisateurs.map(user => `${user.firstname} ${user.lastname}`).join(', ')
      },
      color: this.getStatusColor(task.statut)
    }));
  }

  private getStatusColor(status: string): string {
    const colors = {
      'en-attente': '#D45C00', // Jaune
      'en-cours': '#17a2b8',  // Bleu
      'termine': '#43a14c'     // Vert
    };
    return colors[status] || '#6c757d'; // Gris par défaut
  }

//   openTaskDetails(event: EventApi): void {
// if (!event) {
//     console.error('Event is undefined');
//     return;
//   }
//   const task = {
//     title: event.title || 'Sans titre',
//     start: event.start,
//     end: event.end,
//     description: event.extendedProps?.description,
//     status: event.extendedProps?.status,
//     users: event.extendedProps?.users || []
//   };

//   console.log('Data being passed to modal:', task);
  

  
//   this.dialog.open(TaskDetailsModalComponent, {
//     data: {
//       information: task
//     }
//   });
// }

}
