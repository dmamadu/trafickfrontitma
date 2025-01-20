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
    {
      path: 'liste',
      component: ListTacheComponent
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TasksRoutingModule { }
