import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthenticationService) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.authService.startTokenExpirationCheck();
    }
  }
}
