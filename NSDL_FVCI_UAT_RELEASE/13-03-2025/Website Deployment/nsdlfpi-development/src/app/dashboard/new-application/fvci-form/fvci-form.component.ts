import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  contactData,
  data,
  detailsData,
  docData,
  tableData,
  taxData,
  City,
  Income,
} from '../data';
import { debounceTime, firstValueFrom, Subscription } from 'rxjs';
import {
  CommonService,
  DraftFvciAddressDetailsDto,
  DraftFvciIncomeDetailsDto,
  DraftFvciKycLeiDetailsDto,
  DraftFvciKycDocumentDto,
  DraftFvciTelephoneNumberDetailsDto,
  DraftFvicKycDetailsDto,
  DraftFvicRegistrationDetailsDto,
  FvciApplicationService,
  DraftFvciBenificialOwnershipByControlDto,
  DraftFvciEkycBenificialOwnerDetailsDto,
  DraftFvciInvestmentManagerDetailsDto,
  DraftFvciComplianceOfficerDetailsDto,
  DraftFvciComplianceOfficerEmailDto,
  DraftFvciApplicationDto,
} from '../../../../swagger';
import { SaveApplicationService } from '../../../services/save-application.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { FormProgressService } from '../../../services/form-progress.service';

@Component({
  selector: 'app-fvci-form',
  templateUrl: './fvci-form.component.html',
  standalone: false,
  styleUrls: ['./fvci-form.component.scss'],
  encapsulation: ViewEncapsulation.None, // Add this to allow our preview styles to affect child components
})
export class FvciFormComponent implements OnInit, OnDestroy {
  @Input() applicationId: string | undefined;
  @Input() applicationData: DraftFvciApplicationDto | null = null;
  @Input() previewMode: boolean = false;
  private saveSubscription!: Subscription;

  showLoader = false;

  formGroup: FormGroup = new FormGroup({
    name: new FormControl(''),
    applicantOtherName: new FormGroup({
      otherNameRadio: new FormControl(null),
      otherNameField: new FormControl(''),
    }),
    incorporationDates: new FormArray<FormControl<Date | null>>([]),
    incorporationPlace: new FormArray<FormControl<string | null>>([]),
    legalForm: new FormControl(''),
    lei: new FormControl(''),
    taxResidencyRows: new FormArray<FormGroup>([]),
    registeredOffice: new FormGroup({
      registeredFlatNum: new FormControl(''),
      registeredBuildingName: new FormControl(''),
      registeredCountryName: new FormControl(null),
      registeredRoadName: new FormControl(''),
      registeredAreaName: new FormControl(''),
      registeredTownName: new FormControl(''),
      registeredZipName: new FormControl(''),
      registeredStateName: new FormControl(''),
      notApplicableResidence: new FormControl(false),
    }),
    OfficeInIndia: new FormGroup({
      OfficeInIndiaRadio: new FormControl(null),
      indianFlatNum: new FormControl(''),
      indianBuildingName: new FormControl(''),
      indianCountryName: new FormControl(null),
      indianRoadName: new FormControl(''),
      indianAreaName: new FormControl(''),
      indianTownName: new FormControl(''),
      indianZipName: new FormControl(''),
      indianStateName: new FormControl(''),
      notApplicableIndOffice: new FormControl(null),
    }),
    foreignOffice: new FormGroup({
      foreignFlatNum: new FormControl(''),
      foreignBuildingName: new FormControl(''),
      foreignCountryName: new FormControl(null),
      foreignRoadName: new FormControl(''),
      foreignAreaName: new FormControl(''),
      foreignTownName: new FormControl(''),
      foreignZipName: new FormControl(''),
      foreignStateName: new FormControl(''),
      notApplicableForeignOffice: new FormControl(false),
    }),
    communicationAddress: new FormControl(''),
    managers: new FormArray([]),
    complianceOfficerInfo: new FormGroup({
      complianceOfficerInfoName: new FormControl(''),
      complianceOfficerInfoJob: new FormControl(''),
      complianceOfficerInfoMobile: new FormControl(''),
      complianceOfficerInfoFax: new FormControl(''),
      complianceOfficerInfoEmail: new FormControl(''),
    }),
    ultimateBeneficialOwner: new FormControl(null),
    incomeDetails: new FormGroup({
      incomeSource: new FormControl<City | null>(null),
      businessCode: new FormControl<number | null>(null),
      annualIncome: new FormControl<number | null>(null),
      assetLess: new FormControl<number | null>(null),
    }),
    documentSubmitted: new FormArray<FormControl<string | null>>([]),
    contactDetails: new FormGroup({
      registered: new FormGroup({
        countryCode: new FormControl(null),
        areaCode: new FormControl(''),
        number: new FormControl(''),
      }),
      office: new FormGroup({
        countryCode: new FormControl(null),
        areaCode: new FormControl(''),
        number: new FormControl(''),
      }),
      indianOffice: new FormGroup({
        countryCode: new FormControl(null),
        areaCode: new FormControl(''),
        number: new FormControl(''),
      }),
    }),
    applicantType: new FormGroup({
      applicantTypeName: new FormControl('', Validators.required),
      applicantTypeRadio: new FormControl(null, Validators.required),
      applicantTypeOtherEntity: new FormControl('', Validators.required),
    }),
    sameAsAbove: new FormControl(false),
    designationDetails: new FormArray<FormGroup>([]),
    managingOfficialRows: new FormArray<FormGroup>([]),
    date: new FormControl<Date | null>(null),
    typeOfEntity: new FormControl<string | null>(null),
    selectedCity: new FormControl<City | null>(null),
    beneficialOwnership: new FormControl(null),
    politicallyExposed: new FormControl(null),
    relatedToPoliticallyExposed: new FormControl(null),
  });

  download = '/assets/downloads.png';
  incomeSourceOptions!: Income[];
  proofOfIdentityOptions!: any[];
  selectedIncomeSource!: Income[];
  income: Income[] | undefined;
  countries: any[] = [];
  countryCodes: any[] = [];

  data = data;
  taxData = taxData;
  tableData = tableData;
  contactData = contactData;
  detailsData: any = detailsData;
  docData = docData;

  readonly managerFields = [
    { id: 'a)', name: 'Name of Entity' },
    { id: 'b)', name: 'Type of Entity' },
    { id: 'c)', name: 'Country' },
    { id: 'd)', name: 'Telephone Number' },
    { id: 'e)', name: 'Fax Number' },
    { id: 'f)', name: 'Email Id' },
  ];

  private readonly requiredMapping: any = {
    name: [''],
    applicantOtherName: {
      fields: ['otherNameRadio'],
      conditional: {
        condition: (val: any) => val === true,
        field: 'otherNameField',
      },
    },
    legalForm: [''],
    lei: [''],
    communicationAddress: [''],
    taxResidencyRows: ['trcNo', 'country'],
    registeredOffice: [
      'registeredFlatNum',
      'registeredBuildingName',
      'registeredCountryName',
      'registeredRoadName',
      'registeredAreaName',
      'registeredTownName',
      'registeredZipName',
      'registeredStateName',
    ],
    OfficeInIndia: [
      'OfficeInIndiaRadio',
      'indianFlatNum',
      'indianBuildingName',
      'indianCountryName',
      'indianRoadName',
      'indianAreaName',
      'indianTownName',
      'indianZipName',
      'indianStateName',
    ],
    foreignOffice: [
      'foreignFlatNum',
      'foreignBuildingName',
      'foreignCountryName',
      'foreignRoadName',
      'foreignAreaName',
      'foreignTownName',
      'foreignZipName',
      'foreignStateName',
    ],
    incomeDetails: [
      'incomeSource',
      'businessCode',
      'annualIncome',
      'assetLess',
    ],
  };

  constructor(
    private readonly commonService: CommonService,
    private readonly saveApplicationService: SaveApplicationService,
    private readonly messageService: MessageService,
    private readonly fvciService: FvciApplicationService,
    private readonly router: Router,
    private readonly progressService: FormProgressService
  ) {}

  ngOnInit(): void {
    this.initializeFormArrays();
    this.setupValueChangeSubscriptions();
    this.initializeManagingOfficialRow();
    this.handleSameAsAbove();
    if (!this.previewMode) {
      this.formGroup.valueChanges
        .pipe(debounceTime(300))
        .subscribe(() => this.onFormDataChange());
      this.saveSubscription =
        this.saveApplicationService.saveTrigger$.subscribe(() => {
          this.saveForm();
        });
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

    this.mapInvestmentManagerDetails(appData);
    this.mapKycDetails(appData.kycDetails || {});
    this.mapIncorporationDates(appData.kycDetails || {});
    this.mapTaxResidencyRows(appData.kycLeiDetails || []);
    this.mapIncorporationPlace(appData.kycDetails || {});
    this.mapAddresses(appData.addressDetails || []);
    this.mapComplianceOfficerDetails(appData);
    this.mapContactDetails(appData.telephoneNumberDetails || []);
    this.mapOwnership(appData.ownershipDetails);
    this.mapManagingOfficials(appData.ekycBenificialOwnerDetails || []);
    this.mapIncomeDetails(appData.incomeDetails || []);
    this.mapRegistrationDetails(appData.registrationDetails);
    this.mapDocuments(appData.kycDocuments || []);
  }

  onFormDataChange(): void {
    // Call the new aggregated progress update method with the component identifier and mapping.
    this.progressService.updateComponentProgress(
      'fvciForm',
      this.formGroup.value,
      this.requiredMapping
    );
  }

  private initializeFormArrays(): void {
    this.data.forEach(() => {
      (this.formGroup.get('incorporationDates') as FormArray).push(
        new FormControl<Date | null>(null)
      );
    });
    this.tableData.forEach(() => {
      (this.formGroup.get('incorporationPlace') as FormArray).push(
        new FormControl<string | null>(null)
      );
    });
    this.docData.forEach(() => {
      (this.formGroup.get('documentSubmitted') as FormArray).push(
        new FormControl<string | null>(null)
      );
    });
    this.addManager();
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

  private setupValueChangeSubscriptions(): void {
    this.handleZipToggle(
      'registeredOffice.notApplicableResidence',
      'registeredOffice.registeredZipName'
    );
    this.handleZipToggle(
      'foreignOffice.notApplicableForeignOffice',
      'foreignOffice.foreignZipName'
    );
    this.handleZipToggle(
      'OfficeInIndia.notApplicableIndOffice',
      'OfficeInIndia.indianZipName'
    );

    this.formGroup
      .get('incomeDetails.incomeSource')
      ?.valueChanges.subscribe((selectedIncomeSource) => {
        this.handleBusinessCode(selectedIncomeSource);
      });

    // Add subscription to update country code when country is selected
    const countryControl = this.incorporationPlace.controls[1];
    const countryCodeControl = this.incorporationPlace.controls[2];

    countryControl.valueChanges.subscribe((selectedCountry: any) => {
      if (
        selectedCountry &&
        typeof selectedCountry === 'object' &&
        selectedCountry.code
      ) {
        // Find the matching country code object
        const matchingCountryCode = this.countryCodes.find(
          (cc) => cc.code === selectedCountry.code
        );

        // Update the country code dropdown
        if (matchingCountryCode) {
          countryCodeControl.setValue(matchingCountryCode);
        }
      } else if (!selectedCountry) {
        // Clear the country code if country is cleared
        countryCodeControl.setValue(null);
      }
    });
  }

  private handleZipToggle(controlPath: string, zipControlPath: string): void {
    this.formGroup
      .get(controlPath)
      ?.valueChanges.subscribe((isNotApplicable: boolean) => {
        const zipControl = this.formGroup.get(zipControlPath);
        if (isNotApplicable) {
          zipControl?.disable();
          zipControl?.setValue('');
        } else {
          zipControl?.enable();
        }
      });
  }

  handleBusinessCode(incomeSource: any): void {
    const businessCodeControl = this.formGroup.get(
      'incomeDetails.businessCode'
    );
    if (incomeSource) {
      businessCodeControl?.enable();
      const matchingSource = this.incomeSourceOptions?.find(
        (source) => source.name === incomeSource.name
      );
      if (matchingSource) {
        businessCodeControl?.setValue(matchingSource.code);
      }
    } else {
      businessCodeControl?.disable();
      businessCodeControl?.setValue(null);
    }
  }

  private enableForeignOfficeFields(): void {
    const foreignOfficeGroup = this.formGroup.get('foreignOffice') as FormGroup;
    if (foreignOfficeGroup) {
      Object.keys(foreignOfficeGroup.controls).forEach((key) => {
        foreignOfficeGroup.get(key)?.enable();
      });
    }
  }

  convertToLocalDate(isoDate: string): Date {
    const date = new Date(isoDate);
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    );
  }

  async fetchUserApplication(): Promise<void> {
    await this.loadMasterData();
    // Use existing applicationData if in preview mode
    if (this.previewMode && this.applicationData) {
      this.populateFormWithApplicationData(this.applicationData);
      this.formGroup.disable();
      return;
    }
    if (!this.applicationId) return;
    this.showLoader = true;
    try {
      const response =
        await this.saveApplicationService.fetchExistingApplication(
          this.applicationId
        );
      if (response?.success && response.data) {
        const appData = response.data;
        this.mapInvestmentManagerDetails(appData);
        this.mapKycDetails(appData.kycDetails || {});
        this.mapIncorporationDates(appData.kycDetails || {});
        this.mapTaxResidencyRows(appData.kycLeiDetails || []);
        this.mapIncorporationPlace(appData.kycDetails || {});
        this.mapAddresses(appData.addressDetails || []);
        this.mapComplianceOfficerDetails(appData);
        this.mapContactDetails(appData.telephoneNumberDetails || []);
        this.mapOwnership(appData.ownershipDetails);
        this.mapManagingOfficials(appData.ekycBenificialOwnerDetails || []);
        this.mapIncomeDetails(appData.incomeDetails || []);
        this.mapRegistrationDetails(appData.registrationDetails);
        this.mapDocuments(appData.kycDocuments || []);
        this.progressService.updateComponentProgress(
          'ekycForm',
          this.formGroup.value,
          this.requiredMapping
        );
      }
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

  private mapComplianceOfficerDetails(appData: any) {
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
    });
  }

  private mapKycDetails(kyc: DraftFvicKycDetailsDto): void {
    this.formGroup.patchValue({
      name: kyc.name ?? '',
      applicantOtherName: {
        otherNameRadio: kyc.hasOtherName ?? false,
        otherNameField: kyc.otherName ?? '',
      },
      legalForm: kyc.legalFormAndLawOfIncorporation ?? '',
      lei: kyc.legalEntityIdentifier ?? '',
      communicationAddress: kyc.addressOfCommunication ?? '',
      OfficeInIndia: { OfficeInIndiaRadio: kyc.haveOfficeInIndia ?? false },
      politicallyExposed: kyc.isPoliticallyExposed
        ? 'politicallyExposedYes'
        : 'politicallyExposedNo',
      relatedToPoliticallyExposed: kyc.isRelatedToPoliticallyExposed
        ? 'relatedToPoliticallyExposedYes'
        : 'relatedToPoliticallyExposedNo',
      beneficialOwnership: kyc.doesOtherPersonHolderOwnership ?? null,
    });
  }

  private mapIncorporationDates(kyc: DraftFvicKycDetailsDto): void {
    const dateOfIncorp = kyc.dateOfIncorporation
      ? new Date(kyc.dateOfIncorporation)
      : null;
    const dateOfComm = kyc.dateOfCommencement
      ? new Date(kyc.dateOfCommencement)
      : null;
    const incDates = this.formGroup.get('incorporationDates') as FormArray<
      FormControl<Date | null>
    >;
    incDates.clear();
    incDates.push(new FormControl(dateOfIncorp));
    incDates.push(new FormControl(dateOfComm));
  }

  private mapTaxResidencyRows(leiDetails: DraftFvciKycLeiDetailsDto[]): void {
    const taxRows = this.formGroup.get(
      'taxResidencyRows'
    ) as FormArray<FormGroup>;
    taxRows.clear();

    // If no data is provided or the array is empty, add one empty row.
    if (!leiDetails || leiDetails.length === 0) {
      this.initializeTaxResidencyRow();
      return;
    }

    // Otherwise, map each detail into a new row.
    leiDetails.forEach((leiDetail) => {
      const countryObj = this.countries.find(
        (c) => c.name === leiDetail.countryOfTaxResidence
      );
      this.initializeTaxResidencyRow();
      const lastRow = taxRows.at(taxRows.length - 1);
      lastRow.patchValue({
        id: leiDetail.id ?? this.getNextTaxResidencyId(),
        trcNo: leiDetail.trcNumber ?? '',
        country: countryObj ? countryObj.name : '',
      });
    });
  }

  private mapIncorporationPlace(kyc: DraftFvicKycDetailsDto): void {
    const place = kyc.placeOfIncorporation ?? '';
    const countryName = kyc.countryOfIncorporation ?? '';
    const isdCode = kyc.isdCountryCodeOfIncorporation ?? '';
    const countryObj = this.countries.find((c) => c.name === countryName);
    const countryCodeObj = this.countryCodes.find(
      (code) => code.code === isdCode
    );
    this.formGroup.patchValue({
      incorporationPlace: [place, countryObj ?? {}, countryCodeObj ?? {}],
    });
  }

  private mapAddresses(addresses: DraftFvciAddressDetailsDto[]): void {
    // Registered Office
    const registered = addresses.find((addr) => addr.typeOfAddress === 1);
    if (registered) {
      const regCountry = this.countries.find(
        (c) => c.id === registered.countryId
      );
      this.formGroup.get('registeredOffice')?.patchValue({
        registeredFlatNum: registered.flatBlockNo ?? '',
        registeredBuildingName: registered.buildingPremisesVillageName ?? '',
        registeredCountryName: regCountry ?? null,
        registeredRoadName: registered.roadStreetLaneName ?? '',
        registeredAreaName: registered.areaLocalitySubdivision ?? '',
        registeredTownName: registered.townCityDistrict ?? '',
        registeredZipName: registered.zipCode ?? '',
        registeredStateName: registered.state ?? '',
      });
    }
    // Foreign Office
    const foreign = addresses.find((addr) => addr.typeOfAddress === 2);
    if (foreign) {
      const foreignCountry = this.countries.find(
        (c) => c.id === foreign.countryId
      );
      this.formGroup.get('foreignOffice')?.patchValue({
        foreignFlatNum: foreign.flatBlockNo ?? '',
        foreignBuildingName: foreign.buildingPremisesVillageName ?? '',
        foreignCountryName: foreignCountry ?? null,
        foreignRoadName: foreign.roadStreetLaneName ?? '',
        foreignAreaName: foreign.areaLocalitySubdivision ?? '',
        foreignTownName: foreign.townCityDistrict ?? '',
        foreignZipName: foreign.zipCode ?? '',
        foreignStateName: foreign.state ?? '',
      });
    }
    // Office In India
    const india = addresses.find((addr) => addr.typeOfAddress === 3);
    if (india) {
      const indiaCountry = this.countries.find((c) => c.id === india.countryId);
      this.formGroup.get('OfficeInIndia')?.patchValue({
        indianFlatNum: india.flatBlockNo ?? '',
        indianBuildingName: india.buildingPremisesVillageName ?? '',
        indianCountryName: indiaCountry ?? null,
        indianRoadName: india.roadStreetLaneName ?? '',
        indianAreaName: india.areaLocalitySubdivision ?? '',
        indianTownName: india.townCityDistrict ?? '',
        indianZipName: india.zipCode ?? '',
        indianStateName: india.state ?? '',
      });
    }
  }

  private mapContactDetails(
    phones: DraftFvciTelephoneNumberDetailsDto[]
  ): void {
    const contactGroup = this.formGroup.get('contactDetails') as FormGroup;
    phones.forEach((phone) => {
      if (phone.phoneType === 1) {
        contactGroup.get('registered')?.patchValue({
          countryCode: { code: phone.countryCode },
          areaCode: phone.stdCode,
          number: phone.phoneNumber,
        });
      } else if (phone.phoneType === 2) {
        contactGroup.get('office')?.patchValue({
          countryCode: { code: phone.countryCode },
          areaCode: phone.stdCode,
          number: phone.phoneNumber,
        });
      } else if (phone.phoneType === 3) {
        contactGroup.get('indianOffice')?.patchValue({
          countryCode: phone.countryCode,
          areaCode: phone.stdCode,
          number: phone.phoneNumber,
        });
      }
    });
  }

  private mapOwnership(ownership: any): void {
    if (ownership) {
      this.formGroup.patchValue({
        ultimateBeneficialOwner: !ownership.isNoEntityHoldingGt,
      });
    }
  }

  private mapManagingOfficials(details: any[]): void {
    const moRows = this.formGroup.get('managingOfficialRows') as FormArray;
    moRows.clear();
    if (details.length > 0) {
      details.forEach((ownerDetail) => {
        this.initializeManagingOfficialRow();
        const newRow = moRows.at(moRows.length - 1) as FormGroup;
        newRow.get('details')?.patchValue({
          '1': ownerDetail.nameAddress || '',
          '2': ownerDetail.dateOfBirth
            ? new Date(ownerDetail.dateOfBirth)
            : null,
          '3': ownerDetail.taxResidancyJuridication || '',
          '4': ownerDetail.nationality || '',
          '5': ownerDetail.actingAlongPersonGroupNameAddress || '',
          '6': ownerDetail.boOwnershipInFvci || 0,
          '7': ownerDetail.govermentDocIdentityNumber || '',
          status: ownerDetail.status || 0,
        });
      });
    } else {
      this.initializeManagingOfficialRow();
    }
  }

  private mapIncomeDetails(incomeDetails: any[]): void {
    const incomeGroup = this.formGroup.get('incomeDetails') as FormGroup;
    if (incomeDetails.length > 0) {
      const incomeDetail = incomeDetails[0];
      if (incomeDetail.sourceOfIncome) {
        const incomeSource = this.incomeSourceOptions.find(
          (source) => source.name === incomeDetail.sourceOfIncome
        );
        incomeGroup.patchValue({
          incomeSource,
          businessCode: incomeDetail.codeOfBusiness || '',
          annualIncome: incomeDetail.grossAnnualIncome || 0,
          assetLess: incomeDetail.netWorth || 0,
        });
      }
    }
  }

  private mapRegistrationDetails(registration: any): void {
    this.formGroup.patchValue({
      applicantType: {
        applicantTypeName: registration?.typeOfApplicant || '',
        // Instead of defaulting to 'applicantTypeRadioNo', set to null so it isn't counted as filled.
        applicantTypeRadio: registration?.otherTypeOfApplicant?.length
          ? 'applicantTypeRadioYes'
          : null,
        applicantTypeOtherEntity: registration?.otherTypeOfApplicant || '',
      },
    });
    const typeControl = this.formGroup.get('typeOfEntity');
    if (typeControl && registration?.typeOfEntity) {
      const selectedEntity = this.income?.find(
        (option) => option.name === registration.typeOfEntity
      );
      typeControl.patchValue(selectedEntity || null);
    }
  }

  private mapDocuments(kycDocuments: any[]): void {
    const documentMap = new Map<string, string>();
    kycDocuments.forEach((doc) =>
      documentMap.set(doc.documentType, doc.documentIdentifier)
    );
    const documentArray = this.formGroup.get('documentSubmitted') as FormArray;
    if (documentArray && this.docData.length > 0) {
      this.docData.forEach((item, index) => {
        const documentIdentifier = documentMap.get(item.type) ?? null;
        if (documentArray.at(index)) {
          documentArray.at(index).patchValue(documentIdentifier);
        }
      });
    }
  }

  async downloadFvciPdf(): Promise<void> {
    this.showLoader = true;
    try {
      const resp = await firstValueFrom(
        this.fvciService.apiFvciDownloadFvciApplicationByIdAsyncGet(
          this.applicationId
        )
      );
      let base64String: string;
      if (typeof resp.data === 'string') {
        base64String = resp.data;
      } else if (resp.data && typeof resp.data.pdfBase64 === 'string') {
        base64String = resp.data.pdfBase64;
      } else {
        return;
      }
      const sanitizedBase64 = base64String.replace(/\s/g, '');
      const byteCharacters = atob(sanitizedBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'FvciApplication.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } finally {
      this.showLoader = false;
    }
  }

  get incorporationDates() {
    return this.formGroup.get('incorporationDates') as FormArray<
      FormControl<Date | null>
    >;
  }

  get incorporationPlace() {
    return this.formGroup.get('incorporationPlace') as FormArray<
      FormControl<string | null>
    >;
  }

  get documentSubmitted() {
    return this.formGroup.get('documentSubmitted') as FormArray<
      FormControl<string | null>
    >;
  }

  get designationDetails() {
    return this.formGroup.get('designationDetails') as FormArray<FormGroup>;
  }

  get contactDetails() {
    return this.formGroup.get('contactDetails') as FormGroup;
  }

  get taxResidencyRows() {
    return this.formGroup.get('taxResidencyRows') as FormArray<FormGroup>;
  }

  initializeTaxResidencyRow(): void {
    const row = new FormGroup({
      id: new FormControl(this.getNextTaxResidencyId()),
      trcNo: new FormControl(''),
      country: new FormControl(''),
    });
    this.taxResidencyRows.push(row);
  }

  getNextTaxResidencyId(): string {
    if (this.taxResidencyRows.length === 0) return 'a)';
    const lastId = this.taxResidencyRows
      .at(this.taxResidencyRows.length - 1)
      .get('id')?.value;
    const nextChar = String.fromCharCode(lastId.charCodeAt(0) + 1);
    return `${nextChar})`;
  }

  addTaxResidencyRow(): void {
    this.initializeTaxResidencyRow();
  }

  removeTaxResidencyRow(index: number): void {
    if (this.taxResidencyRows.length > 1) {
      this.taxResidencyRows.removeAt(index);
    }
  }

  get managingOfficialRows() {
    return this.formGroup.get('managingOfficialRows') as FormArray<FormGroup>;
  }

  initializeManagingOfficialRow(): void {
    const row = new FormGroup({
      id: new FormControl(this.getNextManagingOfficialId()),
      details: new FormGroup(
        this.detailsData.reduce((acc: any, field: any) => {
          acc[field.id] = new FormControl('');
          return acc;
        }, {} as { [key: string]: FormControl })
      ),
    });
    this.managingOfficialRows.push(row);
    this.progressService.updateComponentProgress(
      'ekycForm',
      this.formGroup.value,
      this.requiredMapping
    );
  }

  getFormControl(rowIndex: number, fieldId: string): FormControl {
    return (
      this.managingOfficialRows.at(rowIndex).get('details') as FormGroup
    ).get(fieldId) as FormControl;
  }

  hasError(rowIndex: number, fieldId: string): boolean {
    const control = this.getFormControl(rowIndex, fieldId);
    return control.invalid && (control.dirty || control.touched);
  }

  getNextManagingOfficialId(): string {
    if (this.managingOfficialRows.length === 0) return '1';
    const lastId = parseInt(
      this.managingOfficialRows
        .at(this.managingOfficialRows.length - 1)
        .get('id')?.value,
      10
    );
    return (lastId + 1).toString();
  }

  addManagingOfficialRow(): void {
    this.initializeManagingOfficialRow();
  }

  removeManagingOfficialRow(index: number): void {
    if (this.managingOfficialRows.length > 1) {
      this.managingOfficialRows.removeAt(index);
    }
  }

  async loadMasterData(): Promise<void> {
    this.showLoader = true;
    this.incomeSourceOptions = [
      { name: 'Capital Gains', code: 'CG' },
      { name: 'Income from Business/ Profession', code: 'IB' },
      { name: 'No Income', code: 'NI' },
      { name: 'Income from other Sources', code: 'IOT' },
      { name: 'Income from House Property', code: 'IHP' },
    ];

    this.income = [
      { name: 'Private Company', code: 'R' },
      { name: 'Public Company', code: 'U' },
      { name: 'Body Corporation', code: 'D' },
      { name: 'Finanicial Institution', code: 'S' },
      { name: 'No-Government Organisation', code: 'N' },
      { name: 'Charitable Organisation', code: 'C' },
    ];

    try {
      const res: any = await firstValueFrom(
        this.commonService.apiCommonMastersGet()
      );
      if (res?.success && Array.isArray(res.data.country)) {
        this.countries = res.data.country.map((country: any) => ({
          name: country.country_name,
          code: country.country_code,
          id: country.country_id,
        }));
        this.countryCodes = this.countries.map(({ code }) => ({ code }));
      }
      if (res?.success && Array.isArray(res.data.proof_of_identity)) {
        this.proofOfIdentityOptions = res.data.proof_of_identity;
      }
    } catch (error) {
      // Handle error as needed
    } finally {
      this.showLoader = false;
    }
  }

  private toggleForeignOfficeFieldsDisabled(disabled: boolean): void {
    const foreignOfficeGroup = this.formGroup.get('foreignOffice') as FormGroup;
    if (foreignOfficeGroup) {
      Object.keys(foreignOfficeGroup.controls).forEach((key) => {
        const control = foreignOfficeGroup.get(key);
        disabled ? control?.disable() : control?.enable();
      });
    }
  }

  private handleSameAsAbove(): void {
    this.formGroup
      .get('sameAsAbove')
      ?.valueChanges.subscribe((isSameAsAbove: boolean) => {
        const registeredOffice = this.formGroup.get('registeredOffice')?.value;
        if (isSameAsAbove) {
          this.formGroup.get('foreignOffice')?.patchValue({
            foreignFlatNum: registeredOffice.registeredFlatNum,
            foreignBuildingName: registeredOffice.registeredBuildingName,
            foreignCountryName: registeredOffice.registeredCountryName,
            foreignRoadName: registeredOffice.registeredRoadName,
            foreignAreaName: registeredOffice.registeredAreaName,
            foreignTownName: registeredOffice.registeredTownName,
            foreignZipName: registeredOffice.registeredZipName,
            foreignStateName: registeredOffice.registeredStateName,
          });
          this.toggleForeignOfficeFieldsDisabled(true);
        } else {
          this.toggleForeignOfficeFieldsDisabled(false);
          this.formGroup.get('foreignOffice')?.reset();
          this.enableForeignOfficeFields();
        }
      });
  }

  private mergeSubObject<T>(existing: T | undefined, updates: Partial<T>): T {
    return { ...(existing ?? {}), ...updates } as T;
  }

  async saveForm(): Promise<void> {
    // Only check that 'name' is provided
    if (this.formGroup.get('name')?.value) {
      this.showLoader = true;
      try {
        const existingAppResponse =
          await this.saveApplicationService.fetchExistingApplication(
            this.applicationId!
          );
        if (!existingAppResponse?.data) {
          this.router.navigate(['/dashboard/application-list']);
          return;
        }
        const existingApp: DraftFvciApplicationDto = existingAppResponse.data;

        const kycData: DraftFvicKycDetailsDto = this.prepareKycDataForSave();
        const leiDataArray: Array<DraftFvciKycLeiDetailsDto> =
          this.prepareLeiDataForSave();
        const incomeData: DraftFvciIncomeDetailsDto =
          this.prepareIncomeDataForSave();
        const beneficialOwnership: DraftFvciBenificialOwnershipByControlDto =
          this.prepareBeneficialOwnershipDataForSave();
        const addressesData: Array<DraftFvciAddressDetailsDto> =
          this.prepareAddressDataForSave();
        const investmentManagerDetails: DraftFvciInvestmentManagerDetailsDto[] =
          this.getInvestmentManagerDetails();
        const complianceOfficerDetails = this.getComplianceOfficerDetails();
        const complianceOfficerEmail = this.getComplianceOfficerEmail();

        const registrationData: DraftFvicRegistrationDetailsDto =
          this.prepareRegistrationDataForSave();

        const telephoneData: Array<DraftFvciTelephoneNumberDetailsDto> =
          this.prepareTelephoneDataForSave();
        const beneficialOwnerDetails: DraftFvciEkycBenificialOwnerDetailsDto[] =
          this.formGroup.get('ultimateBeneficialOwner')?.value === true
            ? this.prepareBeneficialOwnerDetailsDataForSave()
            : [];
        const kycDocumentDetails: DraftFvciKycDocumentDto[] =
          this.prepareDocumentDataForSave();

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

        const applicationData = this.saveApplicationService.prepareDataForStep1(
          this.applicationId,
          kycData,
          incomeData,
          leiDataArray,
          addressesData,
          investmentManagerDetails,
          updatedComplianceOfficerDetails,
          updatedComplianceOfficerEmail,
          updatedRegistrationDetails,
          telephoneData,
          beneficialOwnership,
          beneficialOwnerDetails,
          kycDocumentDetails
        );
        const response = await this.saveApplicationService.saveData(
          applicationData
        );
        if (response) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.Message || 'Application saved successfully!',
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save application. Please try again.',
          });
        }
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An unexpected error occurred. Please try again.',
        });
      } finally {
        this.showLoader = false;
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Form Invalid',
        detail: 'Name is required.',
      });
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

  prepareKycDataForSave(): DraftFvicKycDetailsDto {
    const formData = this.formGroup.value;
    return {
      name: formData.name,
      hasOtherName: formData.applicantOtherName.otherNameRadio,
      otherName: formData.applicantOtherName.otherNameField,
      dateOfIncorporation: formData.incorporationDates[0],
      dateOfCommencement: formData.incorporationDates[1],
      placeOfIncorporation: formData.incorporationPlace[0],
      countryOfIncorporation: formData.incorporationPlace[1]?.name,
      isdCountryCodeOfIncorporation: formData.incorporationPlace[2]?.code,
      legalFormAndLawOfIncorporation: formData.legalForm,
      legalEntityIdentifier: formData.lei,
      addressOfCommunication: formData.communicationAddress,
      haveOfficeInIndia: formData.OfficeInIndia.OfficeInIndiaRadio,
      doesOtherPersonHolderOwnership: formData.beneficialOwnership,
      isPoliticallyExposed:
        formData.politicallyExposed === 'politicallyExposedYes',
      isRelatedToPoliticallyExposed:
        formData.relatedToPoliticallyExposed ===
        'relatedToPoliticallyExposedYes',
    };
  }

  prepareAddressDataForSave(): Array<DraftFvciAddressDetailsDto> {
    const formData = this.formGroup.value;
    const addressesData: Array<DraftFvciAddressDetailsDto> = [];
    addressesData.push({
      flatBlockNo: formData.registeredOffice.registeredFlatNum,
      buildingPremisesVillageName:
        formData.registeredOffice.registeredBuildingName,
      roadStreetLaneName: formData.registeredOffice.registeredRoadName,
      areaLocalitySubdivision: formData.registeredOffice.registeredAreaName,
      townCityDistrict: formData.registeredOffice.registeredTownName,
      zipCode: formData.registeredOffice.registeredZipName,
      state: formData.registeredOffice.registeredStateName,
      countryId: formData.registeredOffice.registeredCountryName?.id,
      typeOfAddress: 1,
    });
    if (
      !formData.sameAsAbove &&
      !formData.foreignOffice.notApplicableForeignOffice
    ) {
      addressesData.push({
        flatBlockNo: formData.foreignOffice.foreignFlatNum,
        buildingPremisesVillageName: formData.foreignOffice.foreignBuildingName,
        roadStreetLaneName: formData.foreignOffice.foreignRoadName,
        areaLocalitySubdivision: formData.foreignOffice.foreignAreaName,
        townCityDistrict: formData.foreignOffice.foreignTownName,
        zipCode: formData.foreignOffice.foreignZipName,
        state: formData.foreignOffice.foreignStateName,
        countryId: formData.foreignOffice.foreignCountryName?.id,
        typeOfAddress: 2,
      });
    }
    if (
      formData.OfficeInIndia.OfficeInIndiaRadio &&
      !formData.OfficeInIndia.notApplicableIndOffice
    ) {
      addressesData.push({
        flatBlockNo: formData.OfficeInIndia.indianFlatNum,
        buildingPremisesVillageName: formData.OfficeInIndia.indianBuildingName,
        roadStreetLaneName: formData.OfficeInIndia.indianRoadName,
        areaLocalitySubdivision: formData.OfficeInIndia.indianAreaName,
        townCityDistrict: formData.OfficeInIndia.indianTownName,
        zipCode: formData.OfficeInIndia.indianZipName,
        state: formData.OfficeInIndia.indianStateName,
        countryId: formData.OfficeInIndia.indianCountryName?.id,
        typeOfAddress: 3,
      });
    }
    return addressesData;
  }

  prepareTelephoneDataForSave(): Array<DraftFvciTelephoneNumberDetailsDto> {
    const formData = this.formGroup.value;
    return [
      {
        phoneType: 1,
        countryCode: formData.contactDetails.registered.countryCode?.code ?? '',
        stdCode: formData.contactDetails.registered.areaCode,
        phoneNumber: formData.contactDetails.registered.number,
      },
      {
        phoneType: 2,
        countryCode: formData.contactDetails.office.countryCode?.code ?? '',
        stdCode: formData.contactDetails.office.areaCode,
        phoneNumber: formData.contactDetails.office.number,
      },
    ];
  }

  prepareRegistrationDataForSave(): DraftFvicRegistrationDetailsDto {
    const formData = this.formGroup.value;
    return {
      typeOfEntity: formData.typeOfEntity?.name ?? '',
    };
  }

  prepareIncomeDataForSave(): DraftFvciIncomeDetailsDto {
    const formData = this.formGroup.value;
    return {
      sourceOfIncome: formData.incomeDetails.incomeSource?.name,
      codeOfBusiness: formData.incomeDetails.businessCode,
      grossAnnualIncome: Number(formData.incomeDetails.annualIncome),
      netWorth: Number(formData.incomeDetails.assetLess),
    };
  }

  prepareLeiDataForSave(): Array<DraftFvciKycLeiDetailsDto> {
    const formData = this.formGroup.value;
    const leiDataArray: Array<DraftFvciKycLeiDetailsDto> = [];
    formData.taxResidencyRows.forEach((row: any) => {
      if (row.trcNo && row.country) {
        leiDataArray.push({
          trcNumber: row.trcNo,
          countryOfTaxResidence: row.country,
        });
      }
    });
    return leiDataArray;
  }

  prepareBeneficialOwnershipDataForSave(): DraftFvciBenificialOwnershipByControlDto {
    const formData = this.formGroup.value;
    return {
      fvciApplicationId: this.applicationId,
      isNoEntityControlsThroughVoting: !formData.ultimateBeneficialOwner,
    };
  }

  prepareBeneficialOwnerDetailsDataForSave(): DraftFvciEkycBenificialOwnerDetailsDto[] {
    const managingRows = this.formGroup.get(
      'managingOfficialRows'
    ) as FormArray;
    return managingRows.controls.map((rowControl: AbstractControl) => {
      const rowGroup = rowControl as FormGroup;
      const details = rowGroup.get('details') as FormGroup;
      return {
        id: rowGroup.get('id')?.value,
        fvciApplicationId: this.applicationId,
        nameAddress: details.get('1')?.value,
        dateOfBirth: details.get('2')?.value,
        taxResidancyJuridication: details.get('3')?.value,
        nationality: details.get('4')?.value,
        actingAlongPersonGroupNameAddress: details.get('5')?.value,
        boOwnershipInFvci: details.get('6')?.value,
        govermentDocIdentityNumber: details.get('7')?.value,
        status: details.get('status')?.value ?? 0,
      };
    });
  }

  prepareDocumentDataForSave(): DraftFvciKycDocumentDto[] {
    const formData = this.formGroup.value;
    const documents: DraftFvciKycDocumentDto[] = [];
    this.docData.forEach((item, index) => {
      const selectedDocument = formData.documentSubmitted[index] || null;
      if (selectedDocument) {
        documents.push({
          documentType: item.type,
          documentIdentifier: selectedDocument,
          documentPath: '',
          status: 1,
        });
      }
    });
    return documents;
  }
}
