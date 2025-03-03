import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { City, designationData, regulationData } from '../data';
import { firstValueFrom, Subscription } from 'rxjs';
import {
  CommonService,
  DraftFvciApplicationDto,
  DraftFvciComplianceOfficerDetailsDto,
  DraftFvciComplianceOfficerEmailDto,
  DraftFvciGlobalCustodianDetailsDto,
  DraftFvciIncidentsOfLawViolationDto,
  DraftFvciInvestmentManagerDetailsDto,
  DraftFvciRegulatoryAuthorityDetailsDto,
  DraftFvicRegistrationDetailsDto,
} from '../../../../swagger';
import { SaveApplicationService } from '../../../services/save-application.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss'],
  standalone: false,
})
export class RegistrationFormComponent implements OnInit, OnDestroy {
  @Input() applicationId?: string;
  private saveSubscription!: Subscription;
  showLoader = false;
  download = '/assets/downloads.png';
  cities: City[] = [];
  countries: any[] = [];
  countryCodes: any[] = [];
  regulationData = regulationData;
  designationData = designationData;

  readonly managerFields = [
    { id: 'a)', name: 'Name of Entity' },
    { id: 'b)', name: 'Type of Entity' },
    { id: 'c)', name: 'Country' },
    { id: 'd)', name: 'Telephone Number' },
    { id: 'e)', name: 'Fax Number' },
    { id: 'f)', name: 'Email Id' },
  ];

  hasOtherEntity = false;

  formGroup: FormGroup = new FormGroup({
    complianceOfficerInfo: new FormGroup({
      complianceOfficerInfoName: new FormControl(''),
      complianceOfficerInfoJob: new FormControl(''),
      complianceOfficerInfoMobile: new FormControl(''),
      complianceOfficerInfoFax: new FormControl(''),
      complianceOfficerInfoEmail: new FormControl(''),
    }),
    applicantType: new FormGroup({
      applicantTypeName: new FormControl('', Validators.required),
      applicantTypeRadio: new FormControl(null, Validators.required),
      applicantTypeOtherEntity: new FormControl('', Validators.required),
    }),
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
      priorAssociationName: new FormControl('', Validators.required),
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
    managers: new FormArray([]),
    selectedCity: new FormControl<City | null>(null),
    hasOtherEntity: new FormControl(null),
    otherEntityDetails: new FormControl(''),
  });

  constructor(
    private readonly commonService: CommonService,
    private readonly saveApplicationService: SaveApplicationService,
    private readonly messageService: MessageService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.fetchUserApplication();
  }

  ngOnDestroy(): void {
    if (this.saveSubscription) {
      this.saveSubscription.unsubscribe();
    }
  }

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
    this.addManager();
    this.initRegulatoryAuthorityDetails();
    this.initDesignationDetails();
    this.saveSubscription = this.saveApplicationService.saveTrigger$.subscribe(
      () => {
        this.saveForm();
      }
    );
  }

  async fetchUserApplication(): Promise<void> {
    await this.loadMasterData();
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
        this.mapInvestmentManagerDetails(appData);
        this.mapDesignationDetails(appData);
        this.mapComplianceOfficerAndApplicantDetails(appData);
        this.mapRegulatoryAuthorityDetails(appData);
      }
    } catch (error) {
      console.error('Error fetching user application:', error);
      // Optionally show an error message here using messageService
    } finally {
      this.showLoader = false;
    }
  }

  private mapInvestmentManagerDetails(appData: any): void {
    if (appData.investmentManagerDetails?.length) {
      const managersControl = this.managers;
      managersControl.clear();
      appData.investmentManagerDetails.forEach((manager: any) => {
        const managerGroup = this.createManagerFormGroup();
        managerGroup.patchValue({
          'a)': manager.name,
          'b)': manager.type,
          'c)': manager.country,
          'd)': manager.phoneNumber,
          'e)': manager.faxNumber,
          'f)': manager.email,
        });
        managersControl.push(managerGroup);
      });
    }
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

  private mapComplianceOfficerAndApplicantDetails(appData: any): void {
    this.formGroup.patchValue({
      complianceOfficerInfo: {
        complianceOfficerInfoName: appData.complianceOfficerDetails?.name || '',
        complianceOfficerInfoJob:
          appData.complianceOfficerDetails?.jobTitle || '',
        complianceOfficerInfoMobile:
          appData.complianceOfficerDetails?.phoneNumber || '',
        complianceOfficerInfoFax:
          appData.complianceOfficerDetails?.faxNumber || '',
        complianceOfficerInfoEmail: appData.complianceOfficerEmail?.email || '',
      },
      applicantType: {
        applicantTypeName: appData.registrationDetails?.typeOfApplicant || '',
        applicantTypeRadio: appData.registrationDetails?.otherTypeOfApplicant
          ?.length
          ? 'applicantTypeRadioYes'
          : 'applicantTypeRadioNo',
        applicantTypeOtherEntity:
          appData.registrationDetails?.otherTypeOfApplicant || '',
      },
      providedValidForm:
        appData.registrationDetails?.isProvidedFactaCrsProvided || false,
      throughGlobalCustodian: {
        throughGlobalCustodianRadio: appData.registrationDetails
          ?.isComingFromGlobalCustodian
          ? 'throughGlobalCustodianRadioYes'
          : 'throughGlobalCustodianRadioNo',
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
          appData.registrationDetails?.isAssociatedWithSecuritiesMarket ||
          false,
        priorAssociationName: '',
      },
      hasPan: {
        hasPanRadio: appData.registrationDetails?.doesHoldPan || false,
        hasPanNumber: appData.registrationDetails?.panNumber || '',
      },
      disciplinaryHistory: {
        disciplinaryHistoryRadio:
          appData.registrationDetails?.isViolatedLaw || false,
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

  get regulatoryAuthorityDetails(): FormArray<FormControl<string | null>> {
    return this.formGroup.get('regulatoryAuthorityDetails') as FormArray<
      FormControl<string | null>
    >;
  }

  get designatorDetails(): FormArray<FormGroup> {
    return this.formGroup.get('designatorDetails') as FormArray<FormGroup>;
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
      const existingApp = existingAppResponse.data;

      const investmentManagerDetails = this.getInvestmentManagerDetails();
      const complianceOfficerDetails = this.getComplianceOfficerDetails();
      const complianceOfficerEmail = this.getComplianceOfficerEmail();
      const registrationData = this.getRegistrationDetails();
      const regulatoryAuthorityDetailsDto =
        this.getRegulatoryAuthorityDetailsDto();
      const globalCustodianDetails = this.getGlobalCustodianDetails();
      const incidentsOfLawViolation = this.getViolationDetails();

      const updatedComplianceOfficerDetails = this.mergeSubObject(
        existingApp.complianceOfficerDetails,
        complianceOfficerDetails
      );
      const updatedComplianceOfficerEmail = this.mergeSubObject(
        existingApp.complianceOfficerEmail,
        complianceOfficerEmail
      );
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
        investmentManagerDetails: investmentManagerDetails,
        complianceOfficerDetails: updatedComplianceOfficerDetails,
        complianceOfficerEmail: updatedComplianceOfficerEmail,
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

  private getInvestmentManagerDetails(): DraftFvciInvestmentManagerDetailsDto[] {
    return this.managers.controls.map((control) => {
      const value = control.value;
      return {
        fvciApplicationId: this.applicationId,
        name: value['a)'],
        type: value['b)'],
        country: value['c)'],
        phoneNumber: value['d)'],
        faxNumber: value['e)'],
        email: value['f)'],
      };
    });
  }

  private getComplianceOfficerDetails(): DraftFvciComplianceOfficerDetailsDto {
    const group = this.formGroup.get('complianceOfficerInfo') as FormGroup;
    return {
      fvciApplicationId: this.applicationId,
      name: group.get('complianceOfficerInfoName')?.value,
      jobTitle: group.get('complianceOfficerInfoJob')?.value,
      phoneNumber: group.get('complianceOfficerInfoMobile')?.value,
      faxNumber: group.get('complianceOfficerInfoFax')?.value,
    };
  }

  private getComplianceOfficerEmail(): DraftFvciComplianceOfficerEmailDto {
    const group = this.formGroup.get('complianceOfficerInfo') as FormGroup;
    return {
      fvciApplicationId: this.applicationId,
      email: group.get('complianceOfficerInfoEmail')?.value,
    };
  }

  private getRegistrationDetails(): DraftFvicRegistrationDetailsDto {
    const applicantTypeGroup = this.formGroup.get('applicantType') as FormGroup;
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
      fvciApplicationId: this.applicationId,
      typeOfApplicant: applicantTypeGroup.get('applicantTypeName')?.value || '',
      otherTypeOfApplicant: applicantTypeGroup.get('applicantTypeOtherEntity')
        ?.value,
      typeOfEntity: applicantTypeGroup.get('applicantTypeName')?.value,
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
