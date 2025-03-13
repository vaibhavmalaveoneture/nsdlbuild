import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { UserSyncService } from '../../services/user-sync.service';
import { AuthService } from '../../../swagger';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent implements OnInit {
  @ViewChild('forgotForm') forgotForm!: NgForm;

  // Form state variables
  email: string = '';
  captchaInput: string = '';
  otp: string = '';
  showLoader: boolean = false;
  currentStep: number = 1; // 1: Email & Captcha, 2: OTP Verification, 3: Success

  // Captcha variables
  captcha: string = '';
  captchaText: string = '';
  rotationDegree: number = 0;

  // OTP variables
  otpLength: number = 6;
  isDisabled: boolean = false;
  countdownMinutes: number = 1;
  countdownSeconds: number = 0;
  interval: any;
  resetLinkSent: boolean = false;

  constructor(
    private readonly userSyncService: UserSyncService,
    private readonly authService: AuthService,
    private readonly messageService: MessageService
  ) {}

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

  // OTP methods
  async triggerOtp(): Promise<void> {
    this.showLoader = true;
    try {
      // Use directly the AuthService for forgot password OTP
      const payload = {
        email_id: this.email,
      };

      // Call the dedicated forgot password OTP endpoint
      const otpResponse = await firstValueFrom(
        this.authService.apiAuthForgotPasswordSendOtpPost(payload)
      );

      if (otpResponse?.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'OTP Sent',
          detail: otpResponse.message || 'OTP has been sent to your email.',
        });
        this.disableOTPBtnTemp(this.countdownMinutes * 60 * 1000);
        this.currentStep = 2;

        // Store email in session for persistence
        sessionStorage.setItem('userEmail', this.email);
        sessionStorage.setItem('action', 'forgotpassword');
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'OTP Error',
          detail: otpResponse.message || 'Failed to send OTP.',
        });
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'OTP Error',
        detail: error.error?.message || 'Failed to send OTP. Please try again.',
      });
    } finally {
      this.showLoader = false;
    }
  }

  startCountdown() {
    this.countdownMinutes = 1;
    this.countdownSeconds = 0;

    clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (this.countdownSeconds > 0) {
        this.countdownSeconds--;
      } else if (this.countdownMinutes > 0) {
        this.countdownMinutes--;
        this.countdownSeconds = 59;
      } else {
        clearInterval(this.interval);
        this.isDisabled = false;
      }
    }, 1000);
  }

  disableOTPBtnTemp(time: number) {
    this.isDisabled = true;
    this.startCountdown();
    setTimeout(() => {
      this.isDisabled = false;
    }, time);
  }

  onOtpChange(value: string): void {
    this.otp = value;
    if (value && value.length === 6) {
      this.verifyOtp();
    }
  }

  async verifyOtp(): Promise<void> {
    this.showLoader = true;
    try {
      // Create the verify OTP payload
      const payload = {
        email_id: this.email,
        otp: this.otp,
      };

      // Use the dedicated forgot password verify OTP endpoint
      const res = await firstValueFrom(
        this.authService.apiAuthForgotPasswordVerifyOtpPost(payload)
      );

      if (res && res.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: res.message || 'OTP verified successfully.',
        });

        // After successful OTP verification, show the success message
        this.resetLinkSent = true;
        this.currentStep = 3;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password reset link has been sent to your email.',
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: res.message || 'OTP verification failed.',
        });
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      let errorMessage = 'An unknown error occurred while verifying OTP.';
      if (error.status === 400) {
        errorMessage = 'Invalid OTP.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error while verifying OTP.';
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.error?.message || errorMessage,
      });
    } finally {
      this.showLoader = false;
    }
  }

  // This method is no longer needed as the reset link is sent automatically
  // after successful OTP verification by the backend
  // The apiAuthForgotPasswordVerifyOtpPost endpoint handles this

  // Main form submit handler
  onSubmit() {
    if (!this.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter your email address.',
      });
      return;
    }

    if (!this.validateCaptcha()) {
      this.messageService.add({
        severity: 'error',
        summary: 'CAPTCHA Error',
        detail: 'CAPTCHA did not match. Please try again.',
      });
      this.refreshCaptcha();
      return;
    }

    // If email is valid and captcha matches, trigger OTP
    this.triggerOtp();
  }

  // Reset the form and go back to first step
  resetForm() {
    this.email = '';
    this.captchaInput = '';
    this.otp = '';
    this.currentStep = 1;
    this.refreshCaptcha();
    clearInterval(this.interval);
  }
}
