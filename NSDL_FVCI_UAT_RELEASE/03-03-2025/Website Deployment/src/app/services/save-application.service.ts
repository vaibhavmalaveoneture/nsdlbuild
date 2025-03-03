import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import {
  DraftFvciAddressDetailsDto,
  DraftFvciApplicationDto,
  DraftFvciBenificialOwnershipByControlDto,
  DraftFvciEkycBenificialOwnerDetailsDto,
  DraftFvciIncomeDetailsDto,
  DraftFvciKycDocumentDto,
  DraftFvciKycLeiDetailsDto,
  DraftFvciTelephoneNumberDetailsDto,
  DraftFvicKycDetailsDto,
  DraftFvicRegistrationDetailsDto,
  FvciApplicationService,
} from '../../swagger';

@Injectable({
  providedIn: 'root',
})
export class SaveApplicationService {
  private readonly formDataSubject = new BehaviorSubject<any>(null); // Holds form data
  private readonly saveTriggerSubject = new Subject<void>(); // Emits save trigger
  saveTrigger$ = this.saveTriggerSubject.asObservable(); // Observable to listen to

  constructor(private readonly fvciService: FvciApplicationService) {}

  // Method to set form data from components
  setFormData(data: any) {
    this.formDataSubject.next(data); // Store form data in BehaviorSubject
  }

  // Prepare application data for saving
  prepareDataForStep1(
    applicationId: string | undefined,
    kycData: DraftFvicKycDetailsDto,
    incomeData: DraftFvciIncomeDetailsDto,
    leiDataArray: DraftFvciKycLeiDetailsDto[],
    addressesData: DraftFvciAddressDetailsDto[],
    registrationData: DraftFvicRegistrationDetailsDto,
    telephoneData: DraftFvciTelephoneNumberDetailsDto[],
    beneficialOwnershipByControl: DraftFvciBenificialOwnershipByControlDto,
    beneficialOwnerDetails: DraftFvciEkycBenificialOwnerDetailsDto[],
    kycDocumentDetails: DraftFvciKycDocumentDto[]
  ): DraftFvciApplicationDto {
    return {
      applicationId,
      kycDetails: kycData,
      incomeDetails: incomeData ? [incomeData] : undefined,
      kycLeiDetails: leiDataArray,
      addressDetails: addressesData,
      registrationDetails: registrationData,
      telephoneNumberDetails: telephoneData,
      benificialOwnershipByControl: beneficialOwnershipByControl,
      ekycBenificialOwnerDetails: beneficialOwnerDetails,
      kycDocuments: kycDocumentDetails,
      // Add any additional mappings as required
    };
  }

  // Method to get the current form data as an observable
  getFormData() {
    return this.formDataSubject.asObservable();
  }

  // Method to trigger the save (called from MenuComponent)
  triggerSave() {
    this.saveTriggerSubject.next(); // Emit trigger to start save process
  }

  // Save method which will be called when the "Save" button is clicked
  async saveData(applicationData: DraftFvciApplicationDto): Promise<any> {
    if (applicationData) {
      // API call to save or update application data
      const response = await firstValueFrom(
        this.fvciService.apiFvciSaveOrUpdateApplicationPost(applicationData)
      );
      return response;
    }
    return null;
  }

  // New method that sends a blank DTO to generate a new applicationId and returns it.
  async createNewApplication(): Promise<string | null> {
    // Create a blank DTO.
    // Adjust the fields as necessary based on your DTO definitions and API requirements.
    const blankDto: DraftFvciApplicationDto = {
      applicationId: '', // Leave empty so the backend can generate a new id
    };

    try {
      const response = await firstValueFrom(
        this.fvciService.apiFvciSaveOrUpdateApplicationPost(blankDto)
      );
      if (response?.data?.applicationId) {
        return response.data.applicationId;
      }
      return null;
    } catch (error) {
      console.error('Error creating new application:', error);
      return null;
    }
  }

  async fetchExistingApplication(applicationId: string) {
    try {
      return await firstValueFrom(
        this.fvciService.apiFvciGetFvciApplicationByIdAsyncGet(applicationId)
      );
    } catch (error) {
      console.error(
        `Error fetching application with ID ${applicationId}:`,
        error
      );
      throw new Error('Failed to fetch application. Please try again later.');
    }
  }
}
