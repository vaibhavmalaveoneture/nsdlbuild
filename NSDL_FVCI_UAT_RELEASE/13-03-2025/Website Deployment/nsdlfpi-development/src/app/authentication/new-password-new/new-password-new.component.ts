import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserSyncService } from '../../services/user-sync.service';
import { SetNewPasswordDto } from '../../../swagger';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-new-password-new',
  standalone: false,
  templateUrl: './new-password-new.component.html',
  styleUrl: './new-password-new.component.scss'
})
export class NewPasswordNewComponent implements OnInit {
  private readonly router = inject(Router);
  newPassword: string = '';
  confirmPassword: string = '';
  showLoader: boolean = false;

  constructor(
        private readonly userSyncService: UserSyncService,
        private readonly messageService: MessageService,
        private readonly confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    
  }


  async onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Passwords do not match!',
      });
      return;
    }

    this.showLoader = true;

    const authToken = localStorage.getItem('NewPasswordToken'); // Retrieve token from local storage
    
    const setNewPasswordDto: SetNewPasswordDto = {
        newPassword: this.newPassword,
        confirmPassword: this.confirmPassword,
      };

      await this.processSetNewPassword(setNewPasswordDto);

  }


  private async processSetNewPassword(setNewPasswordDto: SetNewPasswordDto) {
    try {
      const res: any = await this.userSyncService.setNewPassword(setNewPasswordDto);
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
          summary: 'Set new password failed.',
          detail: res.message || 'Invalid details.',
        });
        // Refresh captcha after failed login
        // this.refreshCaptcha();
      }
    } catch (error: any) {
      console.error('Set new password error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Set new password Error',
        detail: error.error?.message || 'An error occurred during login.',
      });
      // Refresh captcha after error
    //   this.refreshCaptcha();
    } finally {
      this.showLoader = false;
    }
  }
}
