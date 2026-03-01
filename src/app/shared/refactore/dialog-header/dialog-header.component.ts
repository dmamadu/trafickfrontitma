import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './dialog-header.component.html',
  styleUrls: ['./dialog-header.component.css']
})
export class DialogHeaderComponent {
  @Input() title: string = '';
  @Input() icon: string = 'person_outline';
  @Input() showClose: boolean = true;
  
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}