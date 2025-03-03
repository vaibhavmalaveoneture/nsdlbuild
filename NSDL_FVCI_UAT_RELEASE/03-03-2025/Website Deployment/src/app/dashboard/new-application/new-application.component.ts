import { firstValueFrom } from 'rxjs';
import { FvciApplicationService } from '../../../swagger';
import { Component, Input } from '@angular/core';
import { UserSyncService } from '../../services/user-sync.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-application',
  standalone: false,
  templateUrl: './new-application.component.html',
  styleUrl: './new-application.component.scss',
})
export class NewApplicationComponent {
  @Input() applicationId: string | undefined;

  currentStep: number = 1;

  constructor(
    private readonly userSyncService: UserSyncService,
    private readonly fvciService: FvciApplicationService,
    private readonly router: Router
  ) {}

  async ngOnInit() {
    await this.loadUserProfile();
  }

  updateCurrentStep(step: number) {
    this.currentStep = step;
  }

  async onButtonClick() {
    const response = await firstValueFrom(
      this.fvciService.apiFvciSaveOrUpdateApplicationPost()
    );
  }

  private async loadUserProfile() {
    try {
      const profile = await this.userSyncService.validateSessionAndGetProfile();
      const userData = profile?.data || {};
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }

  // async loadProfile() {
  //   try {

  //     // // Fetch user profile
  //     // const profileResponse =
  //     //   await this.userSyncService.validateSessionAndGetProfile();
  //     // if (!profileResponse) {
  //     //   throw new Error('Failed to retrieve user profile');
  //     // }

  // }
}
