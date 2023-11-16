import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm: FormGroup = this.fb.group({
    user: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(private fb: FormBuilder) {}

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
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
