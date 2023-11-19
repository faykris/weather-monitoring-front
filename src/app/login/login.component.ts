import { Component, EventEmitter, Input, Output} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MainService } from "../main.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @Input() isLogged!: boolean;
  @Output() isLoggedChange = new EventEmitter<boolean>();

  loginForm: FormGroup = this.fb.group({
    user: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private mainService: MainService,
  ) {}

  ngOnInit() {}

  get user() {
    return this.loginForm.get('user');
  }

  get password() {
    return this.loginForm.get('password');
  }

  login() {
    if (this.loginForm.valid) {
      // Cargar info de sensores
      this.mainService.getSensors().subscribe(
        (response) => {
          this.mainService.setSensors(response);
          this.isLoggedChange.emit(true);
        },
        (error) => {
          console.error('Error al iniciar sesión:', error);
        }
      );
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
