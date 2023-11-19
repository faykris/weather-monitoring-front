import {ChangeDetectorRef, Component, ElementRef, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {MainService} from "../main.service";
import { Chart, registerables } from 'chart.js';
import { io, Socket } from 'socket.io-client';
Chart.register(...registerables);


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  public sensors: any[] = [];
  public selectedSensor: any = null;
  public showMenu = false;
  public cronJobStatus: string = '';

  @ViewChild('temperatureCanvas') temperatureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('humidityCanvas') humidityCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pressureCanvas') pressureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('windSpeedCanvas') windSpeedCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('noiseLevelCanvas') noiseLevelCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('airQualityCanvas') airQualityCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChildren('temperatureCanvas') temperatureCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('humidityCanvas') humidityCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('pressureCanvas') pressureCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('windSpeedCanvas') windSpeedCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('noiseLevelCanvas') noiseLevelCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('airQualityCanvas') airQualityCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;


  constructor(
    private mainService: MainService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('listen socket:');
    const socket: Socket = io('https://weather-monitoring-back-6e19852c45b2.herokuapp.com', {
      //withCredentials: true,
    });

    socket.on('cronJobUpdate', (data: string) => {
      this.cronJobStatus = data;
      console.log(this.cronJobStatus);
      this.mainService.getSensors().subscribe(
        (response) => {
          this.mainService.setSensors(response);
          this.getSensors();
          this.cdr.detectChanges();
          // Puedes realizar acciones adicionales, como navegar a otra página
        },
        (error) => {
          console.error('Error al traer el cron job:', error);
        }
      );
    });

    this.getSensors();
  }

  setShowMenu() {
    this.showMenu = true;
  }
  setCloseMenu() {
    this.showMenu = false;
  }

  ngAfterViewInit(): void {

    this.temperatureCanvases.changes.subscribe((canvases: QueryList<ElementRef<HTMLCanvasElement>>) => {
      if (canvases.length > 0 && this.selectedSensor?.sensor_id === 1) {
        this.createTemperatureChart(this.processData(this.sensors));
      }
    });

    this.humidityCanvases.changes.subscribe((canvases: QueryList<ElementRef<HTMLCanvasElement>>) => {
      if (canvases.length > 0 && this.selectedSensor?.sensor_id === 1) {
        this.createHumidityChart(this.processData(this.sensors));
      }
    });

    this.pressureCanvases.changes.subscribe((canvases: QueryList<ElementRef<HTMLCanvasElement>>) => {
      if (canvases.length > 0 && this.selectedSensor?.sensor_id === 2) {
        this.createPressureChart(this.processData(this.sensors));
      }
    });

    this.windSpeedCanvases.changes.subscribe((canvases: QueryList<ElementRef<HTMLCanvasElement>>) => {
      if (canvases.length > 0 && this.selectedSensor?.sensor_id === 2) {
        this.createWindSpeedChart(this.processData(this.sensors));
      }
    });

    this.noiseLevelCanvases.changes.subscribe((canvases: QueryList<ElementRef<HTMLCanvasElement>>) => {
      if (canvases.length > 0 && this.selectedSensor?.sensor_id === 3) {
        this.createNoiseLevelChart(this.processData(this.sensors));
      }
    });

    this.noiseLevelCanvases.changes.subscribe((canvases: QueryList<ElementRef<HTMLCanvasElement>>) => {
      if (canvases.length > 0 && this.selectedSensor?.sensor_id === 3) {
        this.createAirQualityChart(this.processData(this.sensors));
      }
    });
  }

  processData(sensorsData: any[]) {
    const labels = sensorsData[0].data.map((d: any) =>
      `${new Date(d.timestamp).getHours()}:${new Date(d.timestamp).getMinutes()}`
    );

    const temperatureData = sensorsData.find(sensor => sensor.sensor_name === 'Sensor de Clima')?.data.map((d: any) => d.temperature);
    const humidityData = sensorsData.find(sensor => sensor.sensor_name === 'Sensor de Clima')?.data.map((d: any) => d.humidity);

    const pressureData = sensorsData.find(sensor => sensor.sensor_name === 'Sensor Meteorológico')?.data.map((d: any) => d.pressure);
    const windSpeedData = sensorsData.find(sensor => sensor.sensor_name === 'Sensor Meteorológico')?.data.map((d: any) => d.wind_speed);

    const noiseLevelData = sensorsData.find(sensor => sensor.sensor_name === 'Sensor Ambiental')?.data.map((d: any) => d.noise_level);
    const airQualityData = sensorsData.find(sensor => sensor.sensor_name === 'Sensor Ambiental')?.data.map((d: any) => d.air_quality);

    const numericAirQualityData = this.processAirQualityData(airQualityData);
    return { labels, temperatureData, humidityData, pressureData, windSpeedData, noiseLevelData, numericAirQualityData };
  }

  processAirQualityData(airQualityData: string[]) {
    const numericAirQualityData = airQualityData.map((quality) => {
      switch (quality) {
        case 'Buena': return 2;
        case 'Moderada': return 1;
        case 'Mala': return 0;
        default: return 0;
      }
    });

    return numericAirQualityData;
  }

  createTemperatureChart(data: any) {
    const temperatureChart = new Chart(this.temperatureCanvas.nativeElement.getContext('2d')!, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Temperatura',
          data: data.temperatureData,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }

  createHumidityChart(data: any) {
    const humidityChart = new Chart(this.humidityCanvas.nativeElement.getContext('2d')!, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Humedad',
          data: data.humidityData,
          backgroundColor: 'rgba(99,125,255,0.2)',
          borderColor: 'rgb(99,125,255)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }

  createPressureChart(data: any) {
    const pressureChart = new Chart(this.pressureCanvas.nativeElement.getContext('2d')!, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Presión',
          data: data.pressureData,
          backgroundColor: 'rgb(253,216,173)',
          borderColor: 'rgba(204,164,127,0.7)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }

  createWindSpeedChart(data: any) {
    const windSpeedChart = new Chart(this.windSpeedCanvas.nativeElement.getContext('2d')!, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Velocidad del viento',
          data: data.windSpeedData,
          backgroundColor: 'rgba(82,250,211,0.2)',
          borderColor: 'rgb(88,231,210)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }

  createNoiseLevelChart(data: any) {
    const noiseLevelChart = new Chart(this.noiseLevelCanvas.nativeElement.getContext('2d')!, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Nivel de ruido',
          data: data.pressureData,
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }

  createAirQualityChart(data: any) {
    const context = this.airQualityCanvas.nativeElement.getContext('2d');
    if (context) {
      const airQualityChart = new Chart(context, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Calidad del Aire',
            data: data.numericAirQualityData,
            backgroundColor: 'rgba(82,219,250,0.2)',
            borderColor: 'rgb(88,193,231)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value, index, values) {
                  switch (value) {
                    case 2: return 'Buena';
                    case 1: return 'Moderada';
                    case 0: return 'Mala';
                    default: return '';
                  }
                }
              }
            }
          }
        }
      });
    }
  }

  getSensors() {
    this.sensors = this.mainService.getCurrentSensors();
  }

  selectSensor(sensor: any) {
    this.selectedSensor = sensor;
    this.showMenu = false;
  }
}
