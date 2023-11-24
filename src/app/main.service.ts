import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  // URL Heroku will be removed: https://weather-monitoring-back-6e19852c45b2.herokuapp.com
  private apiUrl = 'https://weather-monitoring-back.vercel.app';
  public isLogged = false;
  public sensors: any[] = [];

  constructor(
    private http: HttpClient
  ) { }

  setSensors(sensorList: any[]) {
    this.sensors = sensorList;

  }

  getCurrentSensors() {
    return this.sensors;
  }

  getSensors() {
    return this.http.get<any>(
      `${this.apiUrl}/get-all-sensors`
    );
  }
}
