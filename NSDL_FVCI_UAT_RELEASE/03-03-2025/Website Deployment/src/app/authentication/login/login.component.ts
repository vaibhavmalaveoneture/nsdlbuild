import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserSyncService } from '../../services/user-sync.service';
import { LoginRequestDto } from '../../../swagger';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  showLoader: boolean = false;
  private readonly router = inject(Router);

  constructor(
    private readonly userSyncService: UserSyncService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService
  ) {}

  login = {
    email: '',
    password: '',
  };

  async onSubmit(loginForm: any) {
    if (loginForm.invalid) return;
    this.showLoader = true;

    try {
      const loginDto: LoginRequestDto = {
        emailID: this.login.email,
        password: this.login.password,
      };

      // Step 1: Check if an active session exists
      const sessionCheck = await this.userSyncService.checkActiveSessions(
        loginDto
      );

      if (sessionCheck?.isActive) {
        // Step 2: Show confirmation dialog before proceeding
        this.showLoader = false;
        this.confirmationService.confirm({
          header: 'Active Session Detected',
          message:
            sessionCheck.message ||
            'A previous session is already active. Logging in will terminate the previous session. Do you want to continue?',
          icon: 'pi pi-exclamation-triangle',
          acceptIcon: 'pi pi-check me-2',
          rejectIcon: 'pi pi-times me-2',
          rejectButtonStyleClass: 'p-button-sm me-1',
          acceptButtonStyleClass: 'p-button-outlined p-button-sm me-1',

          accept: async () => {
            await this.processLogin(loginDto);
          },

          reject: () => {
            this.confirmationService.close();
            this.messageService.add({
              severity: 'info',
              summary: 'Login Cancelled',
              detail: 'You cancelled the login attempt.',
            });
          },
        });
      } else {
        // No active session, proceed with login
        await this.processLogin(loginDto);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Login Error',
        detail: error.error?.message || 'An error occurred during login.',
      });
      this.showLoader = false;
    }
  }

  private async processLogin(loginDto: LoginRequestDto) {
    try {
      const res: any = await this.userSyncService.login(loginDto);
      if (res?.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Login Successful',
          detail: 'Welcome back!',
        });
        this.router.navigate(['/dashboard']);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: res.message || 'Invalid credentials.',
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Login Error',
        detail: error.error?.message || 'An error occurred during login.',
      });
    } finally {
      this.showLoader = false;
    }
  }
}
