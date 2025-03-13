import { firstValueFrom } from 'rxjs';
import {
  DraftFvciApplicationDto,
  FvciApplicationService,
} from '../../../swagger';
import { Component, Input, OnInit } from '@angular/core';
import { UserSyncService } from '../../services/user-sync.service';
import { Router } from '@angular/router';
import { SaveApplicationService } from '../../services/save-application.service';
import { FormProgressService } from '../../services/form-progress.service';
import { progressMappingConfig } from '../../config/progress-mapping.config';

@Component({
  selector: 'app-new-application',
  templateUrl: './new-application.component.html',
  styleUrls: ['./new-application.component.scss'],
  standalone: false,
})
export class NewApplicationComponent implements OnInit {
  @Input() applicationId: string | undefined;
  currentStep = 1;
  sidebarCollapsed = false;

  constructor(
    private readonly userSyncService: UserSyncService,
    private readonly fvciService: FvciApplicationService,
    private readonly router: Router,
    private readonly saveApplicationService: SaveApplicationService,
    private readonly progressService: FormProgressService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.restoreSidebarState();
    this.initializeData();
  }

  private async initializeData(): Promise<void> {
    if (!this.applicationId) return;
    try {
      const response =
        await this.saveApplicationService.fetchExistingApplication(
          this.applicationId
        );
      if (response?.data) {
        const applicationData: DraftFvciApplicationDto = response.data;
        // Store the API data in SaveApplicationService
        this.saveApplicationService.setFormData(applicationData);

        // Optionally update overall progress
        this.progressService.updateComponentProgress(
          'overall',
          applicationData,
          progressMappingConfig.overall
        );
      }
    } catch (error) {
      console.error('Error fetching existing application:', error);
    }
  }

  private loadUserProfile(): void {
    this.userSyncService
      .validateSessionAndGetProfile()
      .catch((error) => console.error('Error fetching user info:', error));
  }

  private restoreSidebarState(): void {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.sidebarCollapsed = savedState === 'true';
    }
  }

  updateCurrentStep(step: number): void {
    this.currentStep = step;
  }

  onSidebarToggled(isToggled: boolean): void {
    this.sidebarCollapsed = isToggled;
    localStorage.setItem('sidebarCollapsed', String(isToggled));
  }

  async onButtonClick(): Promise<void> {
    await firstValueFrom(this.fvciService.apiFvciSaveOrUpdateApplicationPost());
  }
}
