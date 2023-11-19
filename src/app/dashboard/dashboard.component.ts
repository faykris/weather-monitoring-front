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
  public socket: any;

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
    this.socket = io('https://weather-monitoring-back-6e19852c45b2.herokuapp.com', {
      //withCredentials: true,
    });

    this.socket.on('cronJobUpdate', (data: string) => {
      this.handleCronJobUpdate(data);
    });

    this.getSensors();
    //this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  private handleCronJobUpdate(data: string) {
    this.cronJobStatus = data;
    console.log('cron job executed:', this.cronJobStatus);
    this.mainService.getSensors().subscribe(
      (response) => {
        this.mainService.setSensors(response);
        this.getSensors();
        console.log('sensors:', this.sensors);

        // Update charts with new data
        const processedData = this.processData(this.sensors);
        this.updateCharts(processedData);

        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error al traer el cron job:', error);
      }
    );
  }
  private updateCharts(data: any) {
    if (this.selectedSensor?.sensor_id === 1) {
      this.updateTemperatureChart(data);
      this.updateHumidityChart(data);
    } else if (this.selectedSensor?.sensor_id === 2) {
      this.updatePressureChart(data);
      this.updateWindSpeedChart(data);
    } else if (this.selectedSensor?.sensor_id === 3) {
      this.updateNoiseLevelChart(data);
      this.updateAirQualityChart(data);
    }
  }

  private updateTemperatureChart(data: any) {
    const temperatureChart = this.getChartInstance(this.temperatureCanvas);
    temperatureChart.data.labels = data.labels;
    temperatureChart.data.datasets[0].data = data.temperatureData;
    temperatureChart.update();
  }

  private updateHumidityChart(data: any) {
    const humidityChart = this.getChartInstance(this.humidityCanvas);
    humidityChart.data.labels = data.labels;
    humidityChart.data.datasets[0].data = data.humidityData;
    humidityChart.update();
  }

  private updatePressureChart(data: any) {
    const pressureChart = this.getChartInstance(this.pressureCanvas);
    pressureChart.data.labels = data.labels;
    pressureChart.data.datasets[0].data = data.pressureData;
    pressureChart.update();
  }

  private updateWindSpeedChart(data: any) {
    const windSpeedChart = this.getChartInstance(this.windSpeedCanvas);
    windSpeedChart.data.labels = data.labels;
    windSpeedChart.data.datasets[0].data = data.windSpeedData;
    windSpeedChart.update();
  }

  private updateNoiseLevelChart(data: any) {
    const noiseLevelChart = this.getChartInstance(this.noiseLevelCanvas);
    noiseLevelChart.data.labels = data.labels;
    noiseLevelChart.data.datasets[0].data = data.noiseLevelData;
    noiseLevelChart.update();
  }

  private updateAirQualityChart(data: any) {
    const airQualityChart = this.getChartInstance(this.airQualityCanvas);
    airQualityChart.data.labels = data.labels;
    airQualityChart.data.datasets[0].data = data.numericAirQualityData;
    airQualityChart.update();
  }

  private getChartInstance(canvas: ElementRef<HTMLCanvasElement>): Chart {
    console.log('canvas', canvas);

    const context = canvas.nativeElement.getContext('2d')!;

    // Check if there is an existing chart
    const existingChart = Chart.getChart(context);

    // If there is an existing chart, destroy it
    if (existingChart) {
      existingChart.destroy();
    }

    return new Chart(context, {
      type: 'line',
      data: {
        labels: [],  // Initial labels
        datasets: [{
          label: 'Data Label',
          data: [],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom'
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
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
          data: data.noiseLevelData,
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
