import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MainService} from "./main.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'weather-monitoring-front';
  @Input() isLogged!: boolean;
  @Output() isLoggedChange = new EventEmitter<boolean>();
  //isLogged: boolean = false;

}
