import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserSyncService } from '../../services/user-sync.service';
import { LoginRequestDto } from '../../../swagger';
import { ConfirmationService, MessageService } from 'primeng/api';
import { jwtDecode } from 'jwt-decode';
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  showLoader: boolean = false;
  private readonly router = inject(Router);

  // Captcha variables
  captcha: string = '';
  captchaText: string = '';
  captchaInput: string = '';
  rotationDegree: number = 0;

  constructor(
    private readonly userSyncService: UserSyncService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService
  ) {}

  login = {
    email: '',
    password: '',
  };

  ngOnInit(): void {
    this.generateCaptcha();
  }

  // Captcha methods
  generateCaptcha() {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set background
    ctx.fillStyle = '#f3f3f3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate random text
    this.captchaText = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Add random lines for noise
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = this.getRandomColor();
      ctx.beginPath();
      ctx.moveTo(
        this.randomInt(0, canvas.width),
        this.randomInt(0, canvas.height)
      );
      ctx.lineTo(
        this.randomInt(0, canvas.width),
        this.randomInt(0, canvas.height)
      );
      ctx.stroke();
    }

    // Draw the text
    for (let i = 0; i < this.captchaText.length; i++) {
      const letter = this.captchaText.charAt(i);
      const x = 20 + i * 20;
      const y = 35;
      const angle = (this.randomInt(-15, 15) * Math.PI) / 180;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = this.getRandomColor();
      ctx.font = '30px Arial';
      ctx.fillText(letter, 0, 0);
      ctx.restore();
    }

    // Add random dots for noise
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = this.getRandomColor();
      ctx.beginPath();
      ctx.arc(
        this.randomInt(0, canvas.width),
        this.randomInt(0, canvas.height),
        1,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // Convert to data URL
    this.captcha = canvas.toDataURL();
  }

  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRandomColor(): string {
    const r = this.randomInt(0, 255);
    const g = this.randomInt(0, 255);
    const b = this.randomInt(0, 255);
    return `rgb(${r}, ${g}, ${b})`;
  }

  refreshCaptcha() {
    this.rotationDegree += 360;
    this.generateCaptcha();
    this.captchaInput = '';
  }

  validateCaptcha(): boolean {
    return this.captchaInput.trim().toUpperCase() === this.captchaText;
  }

  async onSubmit(loginForm: any) {
    if (loginForm.invalid) return;
    
    // Validate captcha before proceeding
    if (!this.validateCaptcha()) {
      this.messageService.add({
        severity: 'error',
        summary: 'CAPTCHA Error',
        detail: 'CAPTCHA did not match. Please try again.',
      });
      this.refreshCaptcha();
      return;
    }
    
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
        console.log("res.token:", res.data)
      const decodedToken: any = jwtDecode(res.data);
      if (decodedToken?.tempPassword) {
        // Store the token and redirect user to change password page
        localStorage.setItem('NewPasswordToken', res.data);
        this.router.navigate(['/auth/new-password']);
      } else {
        this.messageService.add({
          severity: 'success',
          summary: 'Login Successful',
          detail: 'Welcome back!',
        });
        this.router.navigate(['/dashboard']);
      }
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: res.message || 'Invalid credentials.',
        });
        // Refresh captcha after failed login
        this.refreshCaptcha();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Login Error',
        detail: error.error?.message || 'An error occurred during login.',
      });
      // Refresh captcha after error
      this.refreshCaptcha();
    } finally {
      this.showLoader = false;
    }
  }
}