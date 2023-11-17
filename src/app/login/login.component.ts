import {ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
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
    private cdr: ChangeDetectorRef
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
      const user = this.loginForm.get('user')?.value;
      const password = this.loginForm.get('password')?.value;

      console.log('Iniciando sesión con:', user, password);

      this.mainService.getSensors().subscribe(
        (response) => {
          this.mainService.setSensors(response);
          this.isLoggedChange.emit(true);
          this.cdr.detectChanges();
          // Puedes realizar acciones adicionales, como navegar a otra página
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
