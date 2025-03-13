import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  firstValueFrom,
  Observable,
  Subject,
  throwError,
} from 'rxjs';
import {
  BASE_PATH,
  DeleteFileRequest,
  DraftFvciAddressDetailsDto,
  DraftFvciApplicationDto,
  DraftFvciBenificialOwnershipByControlDto,
  DraftFvciComplianceOfficerDetailsDto,
  DraftFvciComplianceOfficerEmailDto,
  DraftFvciEkycBenificialOwnerDetailsDto,
  DraftFvciIncomeDetailsDto,
  DraftFvciInvestmentManagerDetailsDto,
  DraftFvciKycDocumentDto,
  DraftFvciKycLeiDetailsDto,
  DraftFvciTelephoneNumberDetailsDto,
  DraftFvicKycDetailsDto,
  DraftFvicRegistrationDetailsDto,
  FvciApplicationService,
} from '../../swagger';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SaveApplicationService {
  steps: { name: string; step: number }[] = [
    { name: 'EKYC', step: 1 },
    { name: 'FVCI Registration', step: 2 },
    { name: 'Annexture to CAF', step: 3 },
    { name: 'Document Upload', step: 4 },
    { name: 'Declaration and Undertaking', step: 5 },
    { name: 'Acknowledgement', step: 6 },
  ];

  private readonly formDataSubject = new BehaviorSubject<any>(null);
  private readonly saveTriggerSubject = new Subject<void>();
  saveTrigger$ = this.saveTriggerSubject.asObservable();

  constructor(
    private readonly fvciService: FvciApplicationService,
    private readonly http: HttpClient
  ) {}

  setFormData(data: any) {
    this.formDataSubject.next(data);
  }

  prepareDataForStep1(
    applicationId: string | undefined,
    kycData: DraftFvicKycDetailsDto,
    incomeData: DraftFvciIncomeDetailsDto,
    leiDataArray: DraftFvciKycLeiDetailsDto[],
    addressesData: DraftFvciAddressDetailsDto[],
    investmentManagerDetails: DraftFvciInvestmentManagerDetailsDto[],
    complianceOfficerDetails: DraftFvciComplianceOfficerDetailsDto,
    complianceOfficerEmail: DraftFvciComplianceOfficerEmailDto,
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
      investmentManagerDetails,
      complianceOfficerDetails,
      complianceOfficerEmail,
      registrationDetails: registrationData,
      telephoneNumberDetails: telephoneData,
      benificialOwnershipByControl: beneficialOwnershipByControl,
      ekycBenificialOwnerDetails: beneficialOwnerDetails,
      kycDocuments: kycDocumentDetails,
    };
  }

  getSteps() {
    return this.steps;
  }

  getFormData() {
    return this.formDataSubject.asObservable();
  }

  triggerSave() {
    this.saveTriggerSubject.next();
  }

  async saveData(applicationData: DraftFvciApplicationDto): Promise<any> {
    if (applicationData) {
      const response = await firstValueFrom(
        this.fvciService.apiFvciSaveOrUpdateApplicationPost(applicationData)
      );
      return response;
    }
    return null;
  }

  async createNewApplication(): Promise<string | null> {
    const blankDto: DraftFvciApplicationDto = { applicationId: '' };
    try {
      const response = await firstValueFrom(
        this.fvciService.apiFvciSaveOrUpdateApplicationPost(blankDto)
      );
      return response?.data?.applicationId || null;
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

  uploadFile(formData: FormData): Observable<any> {
    const url = `${environment.BASE_PATH}/api/fvci/UploadFileAsync`;
    const token = localStorage.getItem('token') ?? '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(url, formData, { headers });
  }

  viewFile(filePath: string): Observable<any> {
    return this.fvciService.apiFvciDownloadFileAsyncGet(filePath).pipe(
      catchError((err: any) => {
        console.error('Error in viewFile service:', err);
        // Transform the error if needed and return an observable error.
        return throwError(
          () => new Error(err.message || 'Error fetching file')
        );
      })
    );
  }

  deleteFile(request: DeleteFileRequest) {
    return this.fvciService.apiFvciDeleteFileAsyncPost(request).pipe(
      catchError((err: any) => {
        console.error('Error in viewFile service:', err);
        // Transform the error if needed and return an observable error.
        return throwError(
          () => new Error(err.message || 'Error fetching file')
        );
      })
    );
  }
}
