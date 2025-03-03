import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { City, designationData, regulationData, signatoryData } from '../data';
import { firstValueFrom, Subscription } from 'rxjs';
import { CommonService } from '../../../../swagger';
import { SaveApplicationService } from '../../../services/save-application.service';

@Component({
  selector: 'app-annexure-form',
  standalone: false,
  templateUrl: './annexure-form.component.html',
  styleUrl: './annexure-form.component.scss',
})
export class AnnexureFormComponent implements OnInit {
  @Input() applicationId: string | undefined;
  private saveSubscription!: Subscription;
  showLoader = false;
  download: string = '/assets/downloads.png';
  formGroup!: FormGroup;
  cities: City[] | undefined;
  countries: any[] = [];
  countryCodes: any[] = [];
  detailsData: any[] = [{}]; // Initialize with one empty row

  regulationData = regulationData;
  designationData = designationData;
  signatoryData = signatoryData;

  readonly ownerFields = [
    {
      id: 'a)',
      name: 'Name of Beneficial owner',
      type: 'text',
      placeHolder: 'Enter Name',
    },
    {
      id: 'b)',
      name: 'Direct / Indirect Stake',
      type: 'text',
      placeHolder: 'Mention Stake',
    },
    {
      id: 'c)',
      name: 'Names of the entity(ies) through which the stake in the FVCI is held indirectly',
      type: 'text',
      placeHolder: 'Enter Name',
    },
    {
      id: 'd)',
      name: 'Country of Incorporation / Nationality',
      type: 'dropdown',
      placeHolder: 'Select Country',
    },
    {
      id: 'e)',
      name: 'Percentage stake held in the applicant',
      type: 'text',
      placeHolder: 'Enter Percentage',
    },
    {
      id: 'f)',
      name: 'Individual /Non-Individual',
      type: 'text',
      placeHolder: 'Mention Type',
    },
  ];

  readonly managerFields = [
    { id: 'a)', name: 'Name of Entity' },
    { id: 'b)', name: 'Type of Entity' },
    { id: 'c)', name: 'Country' },
    { id: 'd)', name: 'Telephone Number' },
    { id: 'e)', name: 'Fax Number' },
    { id: 'f)', name: 'Email Id' },
  ];

  readonly beneficialFields = [
    {
      id: 'a)',
      name: 'Name of Beneficial owner',
      type: 'text',
      placeHolder: 'Enter Name',
    },
    {
      id: 'b)',
      name: 'Method of Control (Give Details including names of the intermediate structures, if any, through which control is exercised )',
      type: 'text',
      placeHolder: 'Enter Name',
    },
    {
      id: 'c)',
      name: 'Country of Incorporation / Nationality',
      type: 'dropdown',
      placeHolder: 'Select Country',
    },
    {
      id: 'd)',
      name: 'Percentage stake held in the applicant',
      type: 'text',
      placeHolder: 'Enter Percentage',
    },
    {
      id: 'e)',
      name: 'Individual /Non-Individual',
      type: 'text',
      placeHolder: 'Mention Type',
    },
  ];

  constructor(
    private readonly commonService: CommonService,
    private readonly saveApplicationService: SaveApplicationService
  ) {}
  ngOnInit(): void {
    this.formGroup = new FormGroup({
      seggregatedPortfolio: new FormGroup({
        seggregatedPortfolioRadio: new FormControl(null, [Validators.required]),
        seggregatedPortfolioText: new FormControl('', [Validators.required]),
      }),
      bankDeclaration: new FormGroup({
        bankDeclarationRadio: new FormControl(null, [Validators.required]),
        bankDeclarationText: new FormControl('', [Validators.required]),
      }),
      consentIntermediary: new FormGroup({
        consentIntermediaryRadio: new FormControl(null, [Validators.required]),
        consentIntermediaryName: new FormControl(null, [Validators.required]),
        consentIntermediaryEmail1: new FormControl(null, [Validators.required]),
        consentIntermediaryEmail2: new FormControl(null, [Validators.required]),
        consentIntermediaryEmail3: new FormControl(null, [Validators.required]),
        consentIntermediaryMobile: new FormControl(null, [Validators.required]),
      }),
      signatoryRows: new FormArray<FormGroup>([]),
      materialShareholderRows: new FormArray<FormGroup>([]),
      beneficialOwners: new FormArray<FormGroup>([]),
      managers: new FormArray([]),
      selectedCity: new FormControl<City | null>(null),
      intermediateMaterial: new FormControl(null),
      beneficialOwnership: new FormControl(null),
    });
    this.addManager();
    this.addSignatory();
    this.addShareholder();
    this.addBeneficialOwner();
    this.loadData();
    this.saveSubscription = this.saveApplicationService.saveTrigger$.subscribe(
      () => {
        this.saveForm();
      }
    );
    this.fetchUserApplication();
  }

  async fetchUserApplication(): Promise<void> {
    if (!this.applicationId) {
      return;
    }
    this.showLoader = true;
    try {
      const response =
        await this.saveApplicationService.fetchExistingApplication(
          this.applicationId
        );
      if (response?.success && response.data) {
        const appData = response.data;
        console.log(appData);
      }
    } catch (error) {
      console.error('Error fetching user application:', error);
      // Optionally show an error message here using messageService
    } finally {
      this.showLoader = false;
    }
  }

  get signatoryRows(): FormArray<FormGroup> {
    return this.formGroup.get('signatoryRows') as FormArray<FormGroup>;
  }

  getSignatoryFormGroup(index: number): FormGroup {
    return this.signatoryRows.at(index);
  }

  getDetailsFormArray(rowIndex: number): FormArray {
    return this.getSignatoryFormGroup(rowIndex).get('details') as FormArray;
  }

  getDetailControl(rowIndex: number, detailIndex: number): FormControl {
    return this.getDetailsFormArray(rowIndex).at(detailIndex) as FormControl;
  }

  getAccordions(rowIndex: number): any[] {
    return (this.getSignatoryFormGroup(rowIndex).get('accordions') as FormArray)
      .controls;
  }

  addAccordion(rowIndex: number): void {
    const accordions = this.getSignatoryFormGroup(rowIndex).get(
      'accordions'
    ) as FormArray;
    accordions.push(new FormGroup({}));
  }

  removeAccordion(rowIndex: number, accordionIndex: number): void {
    const accordions = this.getSignatoryFormGroup(rowIndex).get(
      'accordions'
    ) as FormArray;
    if (accordions.length > 1) {
      accordions.removeAt(accordionIndex);
    }
  }

  createSignatoryFormGroup(): FormGroup {
    const group = new FormGroup({
      details: new FormArray([new FormControl('', Validators.required)]),
      accordions: new FormArray([new FormGroup({})]),
    });

    this.signatoryData.forEach((field: any) => {
      const initialValue = field.type === 'dropdown' ? null : '';
      group.addControl(
        field.id,
        new FormControl(initialValue, Validators.required)
      );
    });
    return group;
  }

  addSignatory(): void {
    this.signatoryRows.push(this.createSignatoryFormGroup());
  }

  removeSignatory(index: number): void {
    if (this.signatoryRows.length > 1) {
      this.signatoryRows.removeAt(index);
    }
  }

  // Add getter for the FormArray
  get materialShareholderRows(): FormArray<FormGroup> {
    return this.formGroup.get(
      'materialShareholderRows'
    ) as FormArray<FormGroup>;
  }

  // Method to get form group for specific shareholder
  getShareholderFormGroup(index: number): FormGroup {
    return this.materialShareholderRows.at(index);
  }

  // Method to create new shareholder form group
  createShareholderFormGroup(): FormGroup {
    const group = new FormGroup({});
    this.ownerFields.forEach((field) => {
      const initialValue = field.type === 'dropdown' ? null : '';
      group.addControl(
        field.id,
        new FormControl(initialValue, Validators.required)
      );
    });
    return group;
  }

  // Method to add new shareholder
  addShareholder(): void {
    this.materialShareholderRows.push(this.createShareholderFormGroup());
  }

  // Method to remove shareholder
  removeShareholder(index: number): void {
    if (this.materialShareholderRows.length > 1) {
      this.materialShareholderRows.removeAt(index);
    }
  }

  get beneficialOwners(): FormArray {
    return this.formGroup.get('beneficialOwners') as FormArray;
  }

  getBeneficialOwnerFormGroup(index: number): FormGroup {
    return this.beneficialOwners.at(index) as FormGroup;
  }

  createBeneficialOwnerFormGroup(): FormGroup {
    const group = new FormGroup({});
    this.beneficialFields.forEach((field) => {
      const initialValue = field.type === 'dropdown' ? null : '';
      group.addControl(
        field.id,
        new FormControl(initialValue, Validators.required)
      );
    });
    return group;
  }

  addBeneficialOwner(): void {
    this.beneficialOwners.push(this.createBeneficialOwnerFormGroup());
  }

  removeBeneficialOwner(index: number): void {
    if (this.beneficialOwners.length > 1) {
      this.beneficialOwners.removeAt(index);
    }
  }

  async loadData() {
    try {
      const res: any = await firstValueFrom(
        this.commonService.apiCommonCountriesGet()
      );
      if (res?.success && Array.isArray(res.data)) {
        // Parse country data
        this.countries = res.data.map((country: any) => ({
          name: country.country_name,
          code: country.country_code,
          id: country.country_id,
        }));

        // Create country codes array from the same data
        this.countryCodes = this.countries.map(({ code }) => ({
          code,
        }));

        console.log('Countries loaded:', this.countries);
        console.log('Country codes loaded:', this.countryCodes);
      }
    } catch (error) {
      console.error('Error fetching countries data:', error);
    }
  }

  async saveForm() {
    console.log('Saved');
  }

  get managers(): FormArray {
    return this.formGroup.get('managers') as FormArray;
  }

  getManagerFormGroup(index: number): FormGroup {
    return this.managers.at(index) as FormGroup;
  }

  createManagerFormGroup(): FormGroup {
    const group = new FormGroup({});
    this.managerFields.forEach((field) => {
      group.addControl(field.id, new FormControl('', Validators.required));
    });
    return group;
  }

  addManager(): void {
    this.managers.push(this.createManagerFormGroup());
  }

  removeManager(index: number): void {
    if (this.managers.length > 1) {
      this.managers.removeAt(index);
    }
  }
}
