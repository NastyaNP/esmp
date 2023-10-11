import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { finalize, take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly message = inject(NzMessageService);

  public authorizationInProgress: boolean = false;

  validateForm: FormGroup<{
    userName: FormControl<string>;
    password: FormControl<string>;
  }> = this.fb.group({
    userName: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  submitForm(): void {
    if (this.validateForm.valid) {
      this.tryToAuthorize(
        this.validateForm.value.userName!,
        this.validateForm.value.password!
      );
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  private tryToAuthorize(login: string, password: string): void {
    this.authorizationInProgress = true;
    this.authService.authorize(login, password)
      .pipe(
        take(1),
        finalize(() => this.authorizationInProgress = false),
      )
      .subscribe({
        next: (sessionId: string) => this.authService.logIn(sessionId),
        error: (error: HttpErrorResponse) => {
          if ([400, 401, 403].includes(error.status)) {
            this.message.create("error", "Доступ запрещен!", { nzDuration: 2000, nzAnimate: true });
          } else {
            this.message.create("warning", "Что-то пошло не так пожалуйста попробуйте позже.", { nzDuration: 4000, nzAnimate: true });
          }
        }
      })
  }
}
