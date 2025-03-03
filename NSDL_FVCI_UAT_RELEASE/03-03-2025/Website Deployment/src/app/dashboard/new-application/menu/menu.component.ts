import { Component, EventEmitter, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { SaveApplicationService } from '../../../services/save-application.service';

interface Options {
  name: string;
  step: number;
}

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  @Output() stepChanged = new EventEmitter<number>();
  @Output() onButtonClick = new EventEmitter<number>();

  crumbItems: MenuItem[] | undefined;
  steps: Options[] = [
    { name: 'EKYC', step: 1 },
    { name: 'FVCI Registration', step: 2 },
    { name: 'Annexture to CAF', step: 3 },
    { name: 'Document Upload', step: 4 },
    { name: 'Declaration and Undertaking', step: 5 },
    // { name: 'Preview', step: 6 },
    // { name: 'Acknowledgement', step: 7 },
  ];
  selectItems: Options[] = this.steps;
  selectedItem: Options | undefined;

  isSaving: boolean = false; // Flag to show loading state
  saveSuccess: boolean = false; // Flag to show save success state

  constructor(
    private readonly saveApplicationService: SaveApplicationService
  ) {}

  ngOnInit() {
    this.isSaving = true;
    this.crumbItems = [
      { label: 'FPI Monitor' },
      { label: 'New Application' },
      { label: 'EKYC', route: '/new-application' },
    ];
    this.selectedItem = this.steps[0];
    try {
      const previousStep = localStorage.getItem('currentStep');
      if (
        previousStep &&
        !isNaN(parseInt(previousStep)) &&
        parseInt(previousStep) <= 6
      ) {
        this.setActive(parseInt(previousStep));
      }
    } catch (err: any) {
    } finally {
      this.isSaving = false;
    }
  }

  async saveForm() {
    this.isSaving = true; // Set loading state
    try {
      this.saveApplicationService.triggerSave(); // Trigger save in the form component
    } catch (error) {
      console.error('Error saving data', error);
      this.saveSuccess = false;
    } finally {
      this.isSaving = false; // Reset loading state
    }
  }

  totalSteps: number = 5

  buttons = Array.from({ length: this.totalSteps }, (_, index) => ({
    label: `${index + 1}`,
  }));

  active: number = 0;
  currentStep: number = 1;

  setActive(index: number) {
    localStorage.setItem('currentStep', index.toString());
    this.active = index;
    this.currentStep = index + 1;
    this.selectedItem = this.steps[index];
    this.stepChanged.emit(this.currentStep);
  }

  onStepSelect() {
    if (this.selectedItem) {
      this.active = this.selectedItem.step - 1;
      this.currentStep = this.selectedItem.step;
      this.stepChanged.emit(this.currentStep);
    }
  }

  onClickSave() {
    this.onButtonClick.emit();
  }
}
