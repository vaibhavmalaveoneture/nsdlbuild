import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { designationData, regulationData, signatoryData } from '../data';
import { debounceTime, firstValueFrom, Subscription } from 'rxjs';
import {
  CommonService,
  DraftFvciApplicationDto,
  DraftFvciBenificialOwnershipByControlBoDetailsDto,
  DraftFvciBenificialOwnershipByControlDto,
  DraftFvciInfoBasicOfOwnershipBoDetailsDto,
  DraftFvciInformationOfSaSmFvciApplicantDto,
  DraftFvciIsBankDto,
  DraftFvciKraPermissionDto,
  DraftFvciOwnershipDetailsDto,
  DraftFvciSubClassBenificialOwnerDetailsDto,
  DraftFvciSubClassDetailsDto,
} from '../../../../swagger';
import { SaveApplicationService } from '../../../services/save-application.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { FormProgressService } from '../../../services/form-progress.service';

@Component({
  selector: 'app-annexure-form',
  standalone: false,
  templateUrl: './annexure-form.component.html',
  styleUrls: ['./annexure-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AnnexureFormComponent implements OnInit {
  @Input() applicationId: string | undefined;
  @Input() applicationData: DraftFvciApplicationDto | null = null;
  @Input() previewMode: boolean = false;
  private saveSubscription!: Subscription;
  showLoader = false;
  activeAccordionIndices: number[] = [];
  activePanelIndex: number = -1;
  formGroup!: FormGroup;
  countries: any[] = [];
  countryCodes: any[] = [];
  detailsData: any[] = [{}];
  regulationData = regulationData;
  designationData = designationData;
  signatoryData = [...signatoryData];
  authorizedSignatoryData = [...signatoryData];

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
      type: 'dropdown',
      placeHolder: 'Select Type',
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
      type: 'dropdown',
      placeHolder: 'Select Type',
    },
  ];

  types = [
    { label: 'Individual', value: 'Individual' },
    { label: 'Non-Individual', value: 'Non-Individual' },
  ];

  private readonly requiredMapping: { [key: string]: any } = {
    seggregatedPortfolio: [
      'seggregatedPortfolioRadio',
      'seggregatedPortfolioText',
    ],
    bankDeclaration: ['bankDeclarationRadio', 'bankDeclarationText'],
    consentIntermediary: [
      'consentIntermediaryRadio',
      'consentIntermediaryName',
      'consentIntermediaryEmail1',
      'consentIntermediaryEmail2',
      'consentIntermediaryEmail3',
      'consentIntermediaryMobile',
    ],
  };

  constructor(
    private readonly commonService: CommonService,
    private readonly saveApplicationService: SaveApplicationService,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly progressService: FormProgressService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.addManager();
    this.addSignatory();
    this.addShareholder();
    this.addBeneficialOwner();
    this.addInformationOfSaSmFvciApplicant();
    this.loadData();

    if (!this.previewMode) {
      this.formGroup.valueChanges
        .pipe(debounceTime(300))
        .subscribe(() => this.onFormDataChange());
      this.saveSubscription =
        this.saveApplicationService.saveTrigger$.subscribe(() =>
          this.saveForm()
        );
    }

    // Handle both direct applicationData (for preview) and fetching
    if (this.previewMode && this.applicationData) {
      // We already have application data for preview
      this.populateFormWithApplicationData(this.applicationData);
      // Disable the form for preview mode
      this.formGroup.disable();
    } else {
      // Normal case - fetch from API
      this.fetchUserApplication();
    }
  }

  ngOnDestroy(): void {
    if (this.saveSubscription) {
      this.saveSubscription.unsubscribe();
    }
  }

  // New method to populate form with application data
  private populateFormWithApplicationData(
    appData: DraftFvciApplicationDto
  ): void {
    if (!appData) return;

    this.patchSubClassDetails(appData);
    this.patchBankDeclaration(appData);
    this.patchKraPermission(appData);
    this.patchInformationOfSaSmFvciApplicant(appData);
    this.patchOwnershipDetails(appData);
    this.patchBasicOwnership(appData);
    this.patchBeneficialOwnership(appData);
  }

  // Initialize the form controls
  initializeForm(): void {
    this.formGroup = new FormGroup({
      seggregatedPortfolio: new FormGroup({
        seggregatedPortfolioRadio: new FormControl(null, Validators.required),
        seggregatedPortfolioText: new FormControl('', Validators.required),
      }),
      bankDeclaration: new FormGroup({
        bankDeclarationRadio: new FormControl(null, Validators.required),
        bankDeclarationText: new FormControl('', Validators.required),
      }),
      consentIntermediary: new FormGroup({
        consentIntermediaryRadio: new FormControl(null, Validators.required),
        consentIntermediaryName: new FormControl(null, Validators.required),
        consentIntermediaryEmail1: new FormControl(null, Validators.required),
        consentIntermediaryEmail2: new FormControl(null, Validators.required),
        consentIntermediaryEmail3: new FormControl(null, Validators.required),
        consentIntermediaryMobile: new FormControl(null, Validators.required),
      }),
      informationOfSaSmFvciApplicant: new FormArray([]),
      signatoryRows: new FormArray<FormGroup>([]),
      materialShareholderRows: new FormArray<FormGroup>([]),
      beneficialOwners: new FormArray<FormGroup>([]),
      managers: new FormArray([]),
      intermediateMaterial: new FormControl(null),
      entityHolding: new FormControl('', Validators.required),
      beneficialOwnership: new FormControl(null),
    });
  }

  onFormDataChange(): void {
    this.saveApplicationService.setFormData(this.formGroup.value);
    this.progressService.updateComponentProgress(
      'annexureForm',
      this.formGroup.value,
      this.requiredMapping
    );
  }

  handleTabChange(event: any): void {
    this.activePanelIndex = event.index;
  }

  onAccordionTabChange(event: any, rowIndex: number): void {
    this.activeAccordionIndices[rowIndex] = event.index;
  }

  // Methods for Information of SaSmFvci Applicant
  get infoSaSmApplicantRows(): FormArray {
    return this.formGroup.get('informationOfSaSmFvciApplicant') as FormArray;
  }

  getInformationOfSaSmFvciApplicantFormGroup(index: number): FormGroup {
    return this.infoSaSmApplicantRows.at(index) as FormGroup;
  }

  createInformationOfSaSmFvciApplicantFormGroup(): FormGroup {
    const group = new FormGroup({});
    this.authorizedSignatoryData.forEach((field) =>
      group.addControl(field.id, new FormControl('', Validators.required))
    );
    return group;
  }

  addInformationOfSaSmFvciApplicant(): void {
    this.infoSaSmApplicantRows.push(
      this.createInformationOfSaSmFvciApplicantFormGroup()
    );
    this.progressService.updateComponentProgress(
      'annexureForm',
      this.formGroup.value,
      this.requiredMapping
    );
  }

  removeInformationOfSaSmFvciApplicant(index: number): void {
    if (this.infoSaSmApplicantRows.length > 1) {
      this.infoSaSmApplicantRows.removeAt(index);
    }
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
        this.patchSubClassDetails(appData);
        this.patchBankDeclaration(appData);
        this.patchKraPermission(appData);
        this.patchInformationOfSaSmFvciApplicant(appData);
        this.patchOwnershipDetails(appData);
        this.patchBasicOwnership(appData);
        this.patchBeneficialOwnership(appData);
        this.onFormDataChange();
      }
      this.progressService.updateComponentProgress(
        'annexureForm',
        this.formGroup.value,
        this.requiredMapping
      );
    } catch (error) {
      console.error('Error fetching user application:', error);
    } finally {
      this.showLoader = false;
    }
  }

  private patchSubClassDetails(appData: DraftFvciApplicationDto): void {
    if (appData.subClassDetails?.length) {
      this.formGroup
        .get('seggregatedPortfolio')!
        .patchValue({ seggregatedPortfolioRadio: true });
      const signatoryRows = this.formGroup.get('signatoryRows') as FormArray;
      while (signatoryRows.length) {
        signatoryRows.removeAt(0);
      }
      appData.subClassDetails.forEach(
        (subClassDetail: DraftFvciSubClassDetailsDto) => {
          const group = this.createSignatoryFormGroup();
          const ownerDetailsArray = group.get('ownerDetails') as FormArray;
          ownerDetailsArray.clear();
          const detailsArray = group.get('details') as FormArray;
          if (detailsArray?.length) {
            detailsArray.at(0).setValue(subClassDetail.name ?? '');
          }
          if (subClassDetail.subClassBenificialOwnerDetails?.length) {
            subClassDetail.subClassBenificialOwnerDetails.forEach((owner) => {
              const ownerGroup = new FormGroup({
                '1': new FormControl(owner.name ?? '', Validators.required),
                '2': new FormControl(
                  owner.relationshipWithApplicant ?? '',
                  Validators.required
                ),
                '3': new FormControl(owner.pan ?? '', Validators.required),
                '4': new FormControl(
                  owner.nationality ?? '',
                  Validators.required
                ),
                '5': new FormControl(
                  owner.dateOfBirth ? new Date(owner.dateOfBirth) : '',
                  Validators.required
                ),
                '6': new FormControl(
                  owner.residentialAddress ?? '',
                  Validators.required
                ),
                '7': new FormControl(
                  owner.governmentDocIdentityNumber ?? '',
                  Validators.required
                ),
              });
              ownerDetailsArray.push(ownerGroup);
            });
          }
          signatoryRows.push(group);
        }
      );
    }
  }

  private patchBankDeclaration(appData: DraftFvciApplicationDto): void {
    if (appData.isBank) {
      let bankRadioValue = 'not_bank';
      if (appData.isBank.isBank) {
        bankRadioValue = appData.isBank.haveOfficeInIndia
          ? 'bank_with_office'
          : 'bank_no_office';
      }
      this.formGroup.get('bankDeclaration')!.patchValue({
        bankDeclarationRadio: bankRadioValue,
        bankDeclarationText: appData.isBank.nameOfBank ?? '',
      });
    }
  }

  private patchKraPermission(appData: DraftFvciApplicationDto): void {
    if (appData.kraPermission) {
      this.formGroup.get('consentIntermediary')!.patchValue({
        consentIntermediaryRadio: appData.kraPermission.isKraRequired,
        consentIntermediaryName: appData.kraPermission.nameOfFvciRepresentative,
        consentIntermediaryEmail1: appData.kraPermission.email1,
        consentIntermediaryEmail2: appData.kraPermission.email2,
        consentIntermediaryEmail3: appData.kraPermission.email3,
        consentIntermediaryMobile: appData.kraPermission.phoneNumber,
      });
    }
  }

  private patchInformationOfSaSmFvciApplicant(
    appData: DraftFvciApplicationDto
  ): void {
    const infoArray = this.formGroup.get(
      'informationOfSaSmFvciApplicant'
    ) as FormArray;
    if (
      appData.informationOfSaSmFvciApplicant &&
      appData.informationOfSaSmFvciApplicant.length > 0
    ) {
      while (infoArray.length) {
        infoArray.removeAt(0);
      }
      appData.informationOfSaSmFvciApplicant.forEach(
        (item: DraftFvciInformationOfSaSmFvciApplicantDto) => {
          const group = this.createInformationOfSaSmFvciApplicantFormGroup();
          group.patchValue({
            '1': item.name,
            '2': item.relationshipWithApplicant,
            '3': item.pan,
            '4': item.country,
            '5': item.dateOfBirth ? new Date(item.dateOfBirth) : null,
            '6': item.address,
            '7': item.govermentId,
          });
          infoArray.push(group);
        }
      );
    } else {
      this.addInformationOfSaSmFvciApplicant();
    }
  }

  private patchOwnershipDetails(appData: DraftFvciApplicationDto): void {
    if (appData.ownershipDetails) {
      this.formGroup
        .get('intermediateMaterial')!
        .patchValue(appData.ownershipDetails.isNoEntityHoldingGt);
      this.formGroup
        .get('entityHolding')!
        .patchValue(appData.ownershipDetails.entityHolding);
    }
  }

  private patchBasicOwnership(appData: DraftFvciApplicationDto): void {
    const basicArray = this.materialShareholderRows;
    if (appData.infoBasicOfOwnershipBoDetails?.length) {
      while (basicArray.length) {
        basicArray.removeAt(0);
      }
      appData.infoBasicOfOwnershipBoDetails.forEach(
        (item: DraftFvciInfoBasicOfOwnershipBoDetailsDto) => {
          const group = this.createShareholderFormGroup();
          group.patchValue({
            'a)': item.nameOfBo,
            'b)': item.stake,
            'c)': item.nameOfEntity,
            'd)': item.country,
            'e)': item.stakePercentage,
            'f)': item.isIndividual ? 'Individual' : 'Non-Individual',
          });
          basicArray.push(group);
        }
      );
    } else {
      this.addShareholder();
    }
  }

  private patchBeneficialOwnership(appData: DraftFvciApplicationDto): void {
    if (appData.benificialOwnershipByControl) {
      this.formGroup
        .get('beneficialOwnership')!
        .patchValue(
          !appData.benificialOwnershipByControl.isNoEntityControlsThroughVoting
        );
    }
    const beneficialArray = this.beneficialOwners;
    if (appData.benificialOwnershipByControlBoDetails?.length) {
      while (beneficialArray.length) {
        beneficialArray.removeAt(0);
      }
      appData.benificialOwnershipByControlBoDetails.forEach(
        (item: DraftFvciBenificialOwnershipByControlBoDetailsDto) => {
          const group = this.createBeneficialOwnerFormGroup();
          group.patchValue({
            'a)': item.nameOfBo,
            'b)': item.methodOfControl,
            'c)': item.country,
            'd)': item.controlPercentage,
            'e)': item.isIndividual ? 'Individual' : 'Non-Individual',
          });
          beneficialArray.push(group);
        }
      );
    } else {
      this.addBeneficialOwner();
    }
  }

  async saveForm(): Promise<void> {
    if (!this.applicationId) {
      this.router.navigate(['/dashboard/application-list']);
      return;
    }
    console.log('Saving form data from Annexure Form');
    this.showLoader = true;
    try {
      const existingAppResponse =
        await this.saveApplicationService.fetchExistingApplication(
          this.applicationId
        );
      if (!existingAppResponse?.data) {
        this.router.navigate(['/dashboard/application-list']);
        return;
      }
      const existingApp: DraftFvciApplicationDto = existingAppResponse.data;

      const updatedApp: DraftFvciApplicationDto = {
        applicationId: existingApp.applicationId,
        fvciRegistrationNumber: existingApp.fvciRegistrationNumber,
        kycDetails: existingApp.kycDetails,
        kycLeiDetails: existingApp.kycLeiDetails,
        addressDetails: existingApp.addressDetails,
        telephoneNumberDetails: existingApp.telephoneNumberDetails,
        contactDetails: existingApp.contactDetails,
        investmentManagerDetails: existingApp.investmentManagerDetails,
        complianceOfficerDetails: existingApp.complianceOfficerDetails,
        complianceOfficerEmail: existingApp.complianceOfficerEmail,
        kycDocuments: existingApp.kycDocuments,
        regulatoryAuthorityDetails: existingApp.regulatoryAuthorityDetails,
        globalCustodianDetails: existingApp.globalCustodianDetails,
        declarationUndertakingDetails:
          existingApp.declarationUndertakingDetails,
        isBank: this.buildBankDeclaration(),
        kraPermission: this.buildKraPermission(),
        ownershipDetails: this.buildOwnershipDetails(),
        ekycBenificialOwnerDetails: existingApp.ekycBenificialOwnerDetails,
        incomeDetails: existingApp.incomeDetails,
        registrationDetails: existingApp.registrationDetails,
        benificialOwnershipByControlBoDetails:
          this.buildBeneficialOwnershipDetails(),
        benificialOwnershipByControl: this.buildBeneficialOwnershipByControl(),
        infoBasicOfOwnershipBoDetails: this.buildBasicOwnership(),
        informationOfSaSmFvciApplicant: this.buildSaSmFvciApplicants(),
        subClassDetails: this.buildSubClassDetails(),
        incidentsOfLawViolation: existingApp.incidentsOfLawViolation,
        indianMarketAssocians: existingApp.indianMarketAssocians,
      };

      const response = await this.saveApplicationService.saveData(updatedApp);
      if (response) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.Message || 'Application updated successfully!',
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update application. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error saving form:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      this.showLoader = false;
    }
  }

  private buildSubClassDetails(): DraftFvciSubClassDetailsDto[] {
    return this.signatoryRows.controls.map(
      (control: FormGroup): DraftFvciSubClassDetailsDto => {
        const value = control.value;
        const parentName =
          Array.isArray(value.details) && value.details.length
            ? value.details[0]
            : '';
        const ownerDetailsArray = control.get('ownerDetails') as FormArray;
        const ownerDetails: DraftFvciSubClassBenificialOwnerDetailsDto[] =
          ownerDetailsArray.controls.map((ownerControl: any) => {
            const ownerValue = (ownerControl as FormGroup).value;
            return {
              name: ownerValue['1'],
              relationshipWithApplicant: ownerValue['2'],
              pan: ownerValue['3'],
              nationality: ownerValue['4'],
              dateOfBirth: ownerValue['5']
                ? new Date(ownerValue['5'])
                : undefined,
              residentialAddress: ownerValue['6'],
              governmentDocIdentityNumber: ownerValue['7'],
            } as DraftFvciSubClassBenificialOwnerDetailsDto;
          });
        return {
          fvciApplicationId: this.applicationId,
          name: parentName,
          subClassBenificialOwnerDetails: ownerDetails,
        } as DraftFvciSubClassDetailsDto;
      }
    );
  }

  private buildBankDeclaration(): DraftFvciIsBankDto {
    const bankFormValue = this.formGroup.get('bankDeclaration')?.value;
    if (bankFormValue.bankDeclarationRadio === 'bank_with_office') {
      return {
        fvciApplicationId: this.applicationId,
        isBank: true,
        nameOfBank: bankFormValue.bankDeclarationText,
        haveOfficeInIndia: true,
      };
    } else if (bankFormValue.bankDeclarationRadio === 'bank_no_office') {
      return {
        fvciApplicationId: this.applicationId,
        isBank: true,
        nameOfBank: '',
        haveOfficeInIndia: false,
      };
    }
    return {
      fvciApplicationId: this.applicationId,
      isBank: false,
      nameOfBank: '',
      haveOfficeInIndia: false,
    };
  }

  private buildKraPermission(): DraftFvciKraPermissionDto {
    const kraFormValue = this.formGroup.get('consentIntermediary')?.value;
    return {
      fvciApplicationId: this.applicationId,
      isKraRequired: kraFormValue.consentIntermediaryRadio,
      nameOfFvciRepresentative: kraFormValue.consentIntermediaryName,
      email1: kraFormValue.consentIntermediaryEmail1,
      email2: kraFormValue.consentIntermediaryEmail2,
      email3: kraFormValue.consentIntermediaryEmail3,
      phoneNumber: kraFormValue.consentIntermediaryMobile,
    };
  }

  private buildSaSmFvciApplicants(): DraftFvciInformationOfSaSmFvciApplicantDto[] {
    return (this.infoSaSmApplicantRows.controls as FormGroup[]).map(
      (group: FormGroup) => {
        return {
          fvciApplicationId: this.applicationId,
          name: group.get('1')?.value,
          relationshipWithApplicant: group.get('2')?.value,
          pan: group.get('3')?.value,
          country: group.get('4')?.value,
          dateOfBirth: group.get('5')?.value
            ? new Date(group.get('5')!.value)
            : undefined,
          address: group.get('6')?.value,
          govermentId: group.get('7')?.value,
        } as DraftFvciInformationOfSaSmFvciApplicantDto;
      }
    );
  }

  private buildOwnershipDetails(): DraftFvciOwnershipDetailsDto {
    const entityHolding =
      parseFloat(this.formGroup.get('entityHolding')?.value) || 0;
    return {
      fvciApplicationId: this.applicationId,
      isNoEntityHoldingGt: this.formGroup.get('intermediateMaterial')?.value,
      entityHolding,
    };
  }

  private buildBasicOwnership(): DraftFvciInfoBasicOfOwnershipBoDetailsDto[] {
    return this.materialShareholderRows.controls.map((group: FormGroup) => {
      const val = group.value;
      return {
        fvciApplicationId: this.applicationId,
        nameOfBo: val['a)'],
        stake: parseFloat(val['b)']) || undefined,
        nameOfEntity: val['c)'],
        country: val['d)'],
        stakePercentage: parseFloat(val['e)']) || undefined,
        isIndividual: val['f)']?.toLowerCase() === 'individual',
      } as DraftFvciInfoBasicOfOwnershipBoDetailsDto;
    });
  }

  private buildBeneficialOwnershipByControl(): DraftFvciBenificialOwnershipByControlDto {
    const noEntityControls = !this.formGroup.get('beneficialOwnership')?.value;
    return {
      fvciApplicationId: this.applicationId,
      isNoEntityControlsThroughVoting: noEntityControls ?? false,
    };
  }

  private buildBeneficialOwnershipDetails(): DraftFvciBenificialOwnershipByControlBoDetailsDto[] {
    return (this.beneficialOwners.controls as FormGroup[]).map(
      (group: FormGroup) => {
        const val = group.value;
        return {
          fvciApplicationId: this.applicationId,
          nameOfBo: val['a)'],
          methodOfControl: val['b)'],
          country: val['c)'],
          controlPercentage: parseFloat(val['d)']) || undefined,
          isIndividual: val['e)']?.toLowerCase() === 'individual',
        } as DraftFvciBenificialOwnershipByControlBoDetailsDto;
      }
    );
  }

  // Signatory helper methods
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
    const ownerDetails = this.getOwnerDetails(rowIndex);
    ownerDetails.push(
      new FormGroup({
        '1': new FormControl('', Validators.required),
        '2': new FormControl('', Validators.required),
        '3': new FormControl('', Validators.required),
        '4': new FormControl('', Validators.required),
        '5': new FormControl('', Validators.required),
        '6': new FormControl('', Validators.required),
        '7': new FormControl('', Validators.required),
      })
    );
  }

  removeAccordion(rowIndex: number, accordionIndex: number): void {
    const accordions = this.getSignatoryFormGroup(rowIndex).get(
      'accordions'
    ) as FormArray;
    if (accordions.length > 1) {
      accordions.removeAt(accordionIndex);
    }
  }

  removeOwner(signatoryIndex: number, ownerIndex: number): void {
    const ownerDetailsArray = this.getSignatoryFormGroup(signatoryIndex).get(
      'ownerDetails'
    ) as FormArray;
    if (ownerDetailsArray.length > 1) {
      ownerDetailsArray.removeAt(ownerIndex);
    }
  }

  // Added missing methods
  getOwnerDetails(rowIndex: number): FormArray {
    return this.getSignatoryFormGroup(rowIndex).get(
      'ownerDetails'
    ) as FormArray;
  }

  getOwnerGroups(rowIndex: number): FormGroup[] {
    return (
      this.getSignatoryFormGroup(rowIndex).get('ownerDetails') as FormArray
    ).controls as FormGroup[];
  }

  createSignatoryFormGroup(): FormGroup {
    const group = new FormGroup({
      details: new FormArray([new FormControl('', Validators.required)]),
      accordions: new FormArray([new FormGroup({})]),
      ownerDetails: new FormArray([]),
    });
    (group.get('ownerDetails') as FormArray).push(
      new FormGroup({
        '1': new FormControl('', Validators.required),
        '2': new FormControl('', Validators.required),
        '3': new FormControl('', Validators.required),
        '4': new FormControl('', Validators.required),
        '5': new FormControl('', Validators.required),
        '6': new FormControl('', Validators.required),
        '7': new FormControl('', Validators.required),
      })
    );
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
    // Push a default active index (e.g., -1 means no panel is expanded)
    this.activeAccordionIndices.push(-1);
  }

  removeSignatory(index: number): void {
    if (this.signatoryRows.length > 1) {
      this.signatoryRows.removeAt(index);
    }
  }

  // Material Shareholder (Basic Ownership) methods
  get materialShareholderRows(): FormArray<FormGroup> {
    return this.formGroup.get(
      'materialShareholderRows'
    ) as FormArray<FormGroup>;
  }

  getShareholderFormGroup(index: number): FormGroup {
    return this.materialShareholderRows.at(index);
  }

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

  addShareholder(): void {
    this.materialShareholderRows.push(this.createShareholderFormGroup());
  }

  removeShareholder(index: number): void {
    if (this.materialShareholderRows.length > 1) {
      this.materialShareholderRows.removeAt(index);
    }
  }

  // Beneficial Ownership methods
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

  // Manager methods
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

  // Load country data
  async loadData(): Promise<void> {
    try {
      const res: any = await firstValueFrom(
        this.commonService.apiCommonCountriesGet()
      );
      if (res?.success && Array.isArray(res.data)) {
        this.countries = res.data.map((country: any) => ({
          name: country.country_name,
          code: country.country_code,
          id: country.country_id,
        }));
        this.countryCodes = this.countries.map(({ code }) => ({ code }));
      }
    } catch (error) {
      console.error('Error fetching countries data:', error);
    }
  }
}
