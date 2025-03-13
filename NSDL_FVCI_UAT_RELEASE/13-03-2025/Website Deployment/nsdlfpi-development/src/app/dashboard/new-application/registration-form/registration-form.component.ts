import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { City, designationData, regulationData } from '../data';
import { debounceTime, firstValueFrom, Subscription, take } from 'rxjs';
import {
  CommonService,
  DraftFvciApplicationDto,
  DraftFvciGlobalCustodianDetailsDto,
  DraftFvciIncidentsOfLawViolationDto,
  DraftFvciRegulatoryAuthorityDetailsDto,
  DraftFvicRegistrationDetailsDto,
} from '../../../../swagger';
import { SaveApplicationService } from '../../../services/save-application.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { FormProgressService } from '../../../services/form-progress.service';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss'],
  standalone: false,
  encapsulation: ViewEncapsulation.None, // Add this to allow our preview styles to affect child components
})
export class RegistrationFormComponent implements OnInit, OnDestroy {
  @Input() applicationId?: string;
  @Input() applicationData: DraftFvciApplicationDto | null = null;
  @Input() previewMode: boolean = false;
  private saveSubscription!: Subscription;
  showLoader = false;
  download = '/assets/downloads.png';
  countries: any[] = [];
  countryCodes: any[] = [];
  regulationData = regulationData;
  designationData = designationData;

  hasOtherEntity = false;

  formGroup: FormGroup = new FormGroup({
    providedValidForm: new FormControl(null),
    throughGlobalCustodian: new FormGroup({
      throughGlobalCustodianRadio: new FormControl('', Validators.required),
      throughGlobalCustodianName: new FormControl('', Validators.required),
      throughGlobalCustodianAddress: new FormControl('', Validators.required),
    }),
    designatedBank: new FormGroup({
      designatedBankName: new FormControl('', Validators.required),
      designatedBankAddress: new FormControl('', Validators.required),
    }),
    priorAssociation: new FormGroup({
      priorAssociationRadio: new FormControl(null, Validators.required),
      detailsOfPriorAssociation: new FormControl('', Validators.required),
    }),
    hasPan: new FormGroup({
      hasPanRadio: new FormControl(null, Validators.required),
      hasPanNumber: new FormControl('', Validators.required),
    }),
    disciplinaryHistory: new FormGroup({
      disciplinaryHistoryRadio: new FormControl(null, Validators.required),
      disciplinaryHistoryText: new FormControl('', Validators.required),
    }),
    regulatoryAuthorityDetails: new FormArray<FormControl<string | null>>([]),
    designatorDetails: new FormArray<FormGroup>([]),
    selectedCity: new FormControl<City | null>(null),
    hasOtherEntity: new FormControl(null),
    otherEntityDetails: new FormControl(''),
  });

  constructor(
    private readonly commonService: CommonService,
    private readonly saveApplicationService: SaveApplicationService,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly progressService: FormProgressService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
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

  private readonly requiredMapping: { [key: string]: any } = {
    applicantType: {
      fields: ['applicantTypeName', 'applicantTypeRadio'],
      conditional: {
        condition: (value: any) => value === 'applicantTypeRadioYes',
        field: 'applicantTypeOtherEntity',
      },
    },
    providedValidForm: [''],
    throughGlobalCustodian: [
      'throughGlobalCustodianRadio',
      'throughGlobalCustodianName',
      'throughGlobalCustodianAddress',
    ],
    designatedBank: ['designatedBankName', 'designatedBankAddress'],
    priorAssociation: ['priorAssociationRadio', 'detailsOfPriorAssociation'],
    hasPan: ['hasPanRadio', 'hasPanNumber'],
    disciplinaryHistory: [
      'disciplinaryHistoryRadio',
      'disciplinaryHistoryText',
    ],
  };

  private initRegulatoryAuthorityDetails(): void {
    const regulatoryDetails = this.formGroup.get(
      'regulatoryAuthorityDetails'
    ) as FormArray;
    this.regulationData.forEach(() => {
      regulatoryDetails.push(new FormControl(null, Validators.required));
    });
  }

  private initDesignationDetails(): void {
    const designationDetails = this.formGroup.get(
      'designatorDetails'
    ) as FormArray;
    this.designationData.forEach(() => {
      designationDetails.push(
        new FormGroup({
          name: new FormControl(null, Validators.required),
          number: new FormControl(null, Validators.required),
        })
      );
    });
  }

  private initializeForm(): void {
    this.initRegulatoryAuthorityDetails();
    this.initDesignationDetails();
    if (!this.previewMode) {
      this.saveSubscription =
        this.saveApplicationService.saveTrigger$.subscribe(() => {
          this.saveForm();
        });
      this.formGroup.valueChanges
        .pipe(debounceTime(300))
        .subscribe((formValue) => {
          this.progressService.updateComponentProgress(
            'registrationForm',
            formValue,
            this.requiredMapping
          );
        });
    }
  }

  async fetchUserApplication(): Promise<void> {
    await this.loadMasterData();
    // Use existing applicationData if in preview mode
    if (this.previewMode && this.applicationData) {
      this.populateFormWithApplicationData(this.applicationData);
      this.formGroup.disable();
      return;
    }
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

        this.mapDesignationDetails(appData);
        this.mapApplicantDetails(appData);
        this.mapRegulatoryAuthorityDetails(appData);
        this.progressService.updateComponentProgress(
          'registrationForm',
          this.formGroup.value,
          this.requiredMapping
        );
      }
    } catch (error) {
      console.error('Error fetching user application:', error);
      // Optionally show an error message here using messageService
    } finally {
      this.showLoader = false;
    }
  }

  // New method to populate form with application data
  private populateFormWithApplicationData(
    appData: DraftFvciApplicationDto
  ): void {
    if (!appData) return;

    this.mapDesignationDetails(appData);
    this.mapApplicantDetails(appData);
    this.mapRegulatoryAuthorityDetails(appData);
  }

  private mapDesignationDetails(appData: any): void {
    const designationValues = [
      {
        name: appData.registrationDetails?.ddpName,
        number: appData.registrationDetails?.ddpRegistrationNumber,
      },
      {
        name: appData.registrationDetails?.custodianName,
        number: appData.registrationDetails?.custodianRegistrationNumber,
      },
      {
        name: appData.registrationDetails?.dpName,
        number: appData.registrationDetails?.dpRegistrationNumber,
      },
    ];
    const designationDetailsArray = this.designatorDetails;
    designationDetailsArray.clear();
    designationValues.forEach((detail) => {
      designationDetailsArray.push(
        new FormGroup({
          name: new FormControl(detail.name || '', Validators.required),
          number: new FormControl(detail.number || '', Validators.required),
        })
      );
    });
  }

  private mapApplicantDetails(appData: any): void {
    this.formGroup.patchValue({
      applicantType: {
        applicantTypeName: appData.registrationDetails?.typeOfApplicant || '',
        // Instead of defaulting to 'applicantTypeRadioNo', set to null so it isn't counted as filled.
        applicantTypeRadio: appData.registrationDetails?.otherTypeOfApplicant
          ?.length
          ? 'applicantTypeRadioYes'
          : null,
        applicantTypeOtherEntity:
          appData.registrationDetails?.otherTypeOfApplicant || '',
      },
      providedValidForm:
        appData.registrationDetails?.isProvidedFactaCrsProvided || false,
      throughGlobalCustodian: {
        // Set to null if data isn't available, rather than a default string.
        throughGlobalCustodianRadio: appData.registrationDetails
          ?.isComingFromGlobalCustodian
          ? 'throughGlobalCustodianRadioYes'
          : null,
        throughGlobalCustodianName:
          appData.registrationDetails?.custodianName || '',
        throughGlobalCustodianAddress:
          appData.registrationDetails?.custodianRegistrationNumber || '',
      },
      designatedBank: {
        designatedBankName: appData.registrationDetails?.bankName || '',
        designatedBankAddress: appData.registrationDetails?.bankAddress || '',
      },
      priorAssociation: {
        priorAssociationRadio:
          appData.registrationDetails?.isAssociatedWithSecuritiesMarket || null,
        detailsOfPriorAssociation:
          appData.registrationDetails?.detailsOfPriorAssociation || '',
      },
      hasPan: {
        hasPanRadio: appData.registrationDetails?.doesHoldPan || null,
        hasPanNumber: appData.registrationDetails?.panNumber || '',
      },
      disciplinaryHistory: {
        disciplinaryHistoryRadio:
          appData.registrationDetails?.isViolatedLaw || null,
        disciplinaryHistoryText:
          appData.incidentsOfLawViolation?.description || '',
      },
    });
  }

  private mapRegulatoryAuthorityDetails(appData: any): void {
    if (appData.regulatoryAuthorityDetails) {
      const regDetails = appData.regulatoryAuthorityDetails;
      const regulatoryFormArray = this.regulatoryAuthorityDetails;
      if (regulatoryFormArray.length >= 5) {
        regulatoryFormArray
          .at(0)
          .patchValue(regDetails.regulatoryAuthorityName || '');
        regulatoryFormArray
          .at(1)
          .patchValue(regDetails.regulatoryAuthorityCountry || '');
        regulatoryFormArray
          .at(2)
          .patchValue(regDetails.regulatoryAuthorityWebsite || '');
        regulatoryFormArray
          .at(3)
          .patchValue(regDetails.regulatoryAuthorityRegNumber || '');
        regulatoryFormArray
          .at(4)
          .patchValue(regDetails.regulatoryAuthorityCategory || '');
      }
    }
  }

  async loadMasterData(): Promise<void> {
    try {
      console.log("loading master data")
      const res: any = await firstValueFrom(
        this.commonService.apiCommonCountriesGet()
      );
      console.log("res.",res.success)
      console.log("data.",res.data)
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

  get regulatoryAuthorityDetails(): FormArray<FormControl<string | null>> {
    return this.formGroup.get('regulatoryAuthorityDetails') as FormArray<
      FormControl<string | null>
    >;
  }

  get designatorDetails(): FormArray<FormGroup> {
    return this.formGroup.get('designatorDetails') as FormArray<FormGroup>;
  }

  private mergeSubObject<T>(existing: T | undefined, updates: Partial<T>): T {
    return { ...(existing ?? {}), ...updates } as T;
  }

  async saveForm(): Promise<void> {
    if (!this.applicationId) {
      this.router.navigate(['/dashboard/application-list']);
      return;
    }

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

      const registrationData = this.getRegistrationDetails();
      const regulatoryAuthorityDetailsDto =
        this.getRegulatoryAuthorityDetailsDto();
      const globalCustodianDetails = this.getGlobalCustodianDetails();
      const incidentsOfLawViolation = this.getViolationDetails();

      const updatedRegistrationDetails = this.mergeSubObject(
        existingApp.registrationDetails,
        registrationData
      );
      const updatedRegulatoryAuthorityDetails = this.mergeSubObject(
        existingApp.regulatoryAuthorityDetails,
        regulatoryAuthorityDetailsDto
      );
      const updatedGlobalCustodianDetails = this.mergeSubObject(
        existingApp.globalCustodianDetails,
        globalCustodianDetails
      );
      const updateViolationDetails = this.mergeSubObject(
        existingApp.incidentsOfLawViolation,
        incidentsOfLawViolation
      );

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
        regulatoryAuthorityDetails: updatedRegulatoryAuthorityDetails,
        globalCustodianDetails: updatedGlobalCustodianDetails,
        declarationUndertakingDetails:
          existingApp.declarationUndertakingDetails,
        isBank: existingApp.isBank,
        kraPermission: existingApp.kraPermission,
        ownershipDetails: existingApp.ownershipDetails,
        ekycBenificialOwnerDetails: existingApp.ekycBenificialOwnerDetails,
        incomeDetails: existingApp.incomeDetails,
        registrationDetails: updatedRegistrationDetails,
        benificialOwnershipByControlBoDetails:
          existingApp.benificialOwnershipByControlBoDetails,
        benificialOwnershipByControl: existingApp.benificialOwnershipByControl,
        infoBasicOfOwnershipBoDetails:
          existingApp.infoBasicOfOwnershipBoDetails,
        informationOfSaSmFvciApplicant:
          existingApp.informationOfSaSmFvciApplicant,
        subClassDetails: existingApp.subClassDetails,
        incidentsOfLawViolation: updateViolationDetails,
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

  private getRegistrationDetails(): DraftFvicRegistrationDetailsDto {
    const custodianGroup = this.formGroup.get(
      'throughGlobalCustodian'
    ) as FormGroup;
    const bankGroup = this.formGroup.get('designatedBank') as FormGroup;
    const priorAssociationGroup = this.formGroup.get(
      'priorAssociation'
    ) as FormGroup;
    const panGroup = this.formGroup.get('hasPan') as FormGroup;
    const disciplinaryGroup = this.formGroup.get(
      'disciplinaryHistory'
    ) as FormGroup;

    return {
      // fvciApplicationId: this.applicationId,
      // typeOfApplicant: applicantTypeGroup.get('applicantTypeName')?.value || '',
      // otherTypeOfApplicant: applicantTypeGroup.get('applicantTypeOtherEntity')
      //   ?.value,
      // typeOfEntity: applicantTypeGroup.get('applicantTypeName')?.value,
      isProvidedFactaCrsProvided:
        !!this.formGroup.get('providedValidForm')?.value,
      isComingFromGlobalCustodian:
        custodianGroup.get('throughGlobalCustodianRadio')?.value ===
        'throughGlobalCustodianRadioYes',

      ddpName: this.designatorDetails.at(0)?.get('name')?.value || '',
      ddpRegistrationNumber:
        this.designatorDetails.at(0)?.get('number')?.value || '',
      custodianName: this.designatorDetails.at(1)?.get('name')?.value || '',
      custodianRegistrationNumber:
        this.designatorDetails.at(1)?.get('number')?.value || '',
      dpName: this.designatorDetails.at(2)?.get('name')?.value || '',
      dpRegistrationNumber:
        this.designatorDetails.at(2)?.get('number')?.value || '',

      bankName: bankGroup.get('designatedBankName')?.value,
      bankAddress: bankGroup.get('designatedBankAddress')?.value,
      isAssociatedWithSecuritiesMarket:
        priorAssociationGroup.get('priorAssociationRadio')?.value === true ||
        priorAssociationGroup.get('priorAssociationRadio')?.value === 'true',
      detailsOfPriorAssociation: priorAssociationGroup.get(
        'detailsOfPriorAssociation'
      )?.value,
      doesHoldPan:
        panGroup.get('hasPanRadio')?.value === true ||
        panGroup.get('hasPanRadio')?.value === 'true',
      panNumber: panGroup.get('hasPanNumber')?.value,
      isViolatedLaw:
        disciplinaryGroup.get('disciplinaryHistoryRadio')?.value === true ||
        disciplinaryGroup.get('disciplinaryHistoryRadio')?.value === 'true',
    };
  }

  private getRegulatoryAuthorityDetailsDto(): DraftFvciRegulatoryAuthorityDetailsDto {
    const regulatoryArray = this.regulatoryAuthorityDetails;
    return {
      fvciApplicationId: this.applicationId,
      regulatoryAuthorityName: regulatoryArray.at(0)?.value ?? '',
      regulatoryAuthorityCountry: regulatoryArray.at(1)?.value ?? '',
      regulatoryAuthorityWebsite: regulatoryArray.at(2)?.value ?? '',
      regulatoryAuthorityRegNumber: regulatoryArray.at(3)?.value ?? '',
      regulatoryAuthorityCategory: regulatoryArray.at(4)?.value ?? '',
    };
  }

  private getGlobalCustodianDetails(): DraftFvciGlobalCustodianDetailsDto {
    const custodianGroup = this.formGroup.get('throughGlobalCustodian');
    if (
      custodianGroup?.get('throughGlobalCustodianRadio')?.value ===
      'throughGlobalCustodianRadioYes'
    ) {
      return {
        fvciApplicationId: this.applicationId,
        name: custodianGroup.get('throughGlobalCustodianName')?.value || '',
        address:
          custodianGroup.get('throughGlobalCustodianAddress')?.value || '',
      };
    }
    return {} as DraftFvciGlobalCustodianDetailsDto;
  }

  private getViolationDetails(): DraftFvciIncidentsOfLawViolationDto {
    const disciplinaryGroup = this.formGroup.get('disciplinaryHistory');
    if (disciplinaryGroup?.get('disciplinaryHistoryRadio')?.value) {
      return {
        description:
          disciplinaryGroup.get('disciplinaryHistoryText')?.value || '',
      };
    }
    return { description: undefined };
  }
}
