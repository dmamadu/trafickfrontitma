// task-details-modal.component.ts
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AngularMaterialModule } from 'src/app/shared/angular-materiel-module/angular-materiel-module';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatChipsModule,
    AngularMaterialModule,FormsModule
  ],
  selector: 'app-task-details-modal',
  styleUrl: "./task-details-modal.component.css",
  templateUrl: './task-details-modal.component.html',
})
export class TaskDetailsModalComponent {

  tacheToDisplay: any = {
    title: 'Sans titre',
    start: null,
    end: null,
    description: 'Aucune description',
    status: 'inconnu',
    users: []
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public matDialogRef: MatDialogRef<TaskDetailsModalComponent>,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    console.log('Task data:', data);

    if (data?.information) {
      this.tacheToDisplay = {
        title: data.information.title || this.tacheToDisplay.title,
        start: data.information.start ? new Date(data.information.start) : null,
        end: data.information.end ? new Date(data.information.end) : null,
        description: data.information.description || this.tacheToDisplay.description,
        status: data.information.status || this.tacheToDisplay.status,
        users: data.information.users || this.tacheToDisplay.users
      };
    }
    
    console.log('Task data:', this.tacheToDisplay);
    this.changeDetectorRef.detectChanges();
  }

  
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'en-attente': '#FFC107',
      'en-cours': '#17A2B8',
      'termine': '#28A745'
    };
    return colors[status] || '#6C757D';
  }
  
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'en-attente': 'En attente',
      'en-cours': 'En cours',
      'termine': 'Terminé'
    };
    return labels[status] || status;
  }
  closeModal() {
    this.matDialogRef.close();
  }
}
