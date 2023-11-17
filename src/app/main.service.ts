import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  private apiUrl = 'http://localhost:3000';
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