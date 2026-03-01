import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreatetaskComponent } from './createtask/createtask.component';
import { ListTacheComponent } from './listTache/list.component';

const routes: Routes = [
    // {
    //     path: 'list',
    //     component:
    // },
    {
        path: 'create',
        component: CreatetaskComponent
    },
//     {
//       path: 'liste',
//       component: ListTacheComponent
//   },
    { path: 'liste', loadComponent: () => import('./task-calendar/task-calendar.component').then(m => m.TaskCalendarComponent) },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TasksRoutingModule { }
