import { Component, Input } from '@angular/core';
import { SaveApplicationService } from '../../services/save-application.service';
import { firstValueFrom } from 'rxjs';
import { FvciApplicationService } from '../../../swagger';

@Component({
  selector: 'app-form-layout',
  standalone: false,
  templateUrl: './form-layout.component.html',
  styleUrl: './form-layout.component.scss',
})
export class FormLayoutComponent {
  @Input() applicationId: string | undefined;
  @Input() currentStep: number = 1;

  currentComponent!: string;
  download = '/assets/downloads.png';

  constructor(
    private readonly saveApplicationService: SaveApplicationService,
    private readonly fvciService: FvciApplicationService
  ) {}

  ngOnInit() {
    console.log("FormLayoutComponent initialized with applicationId:", this.applicationId);

    this.initializeComponent();
  }

  updateCurrentStep(step: number): void {
    this.currentStep = step;
    this.saveApplicationService.getSteps().forEach((step) => {
      if (step.step === this.currentStep) {
        this.currentComponent = step.name;
      }
    });
  }

  async onButtonClick(): Promise<void> {
    await firstValueFrom(this.fvciService.apiFvciSaveOrUpdateApplicationPost());
  }

  initializeComponent() {
    this.saveApplicationService.getSteps().forEach((step) => {
      if (step.step === this.currentStep) {
        this.currentComponent = step.name;
      }
    });
  }
}
