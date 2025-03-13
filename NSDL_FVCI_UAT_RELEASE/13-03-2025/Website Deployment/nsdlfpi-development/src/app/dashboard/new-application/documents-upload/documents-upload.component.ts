import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SaveApplicationService } from '../../../services/save-application.service';
import { FormProgressService } from '../../../services/form-progress.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface FileData {
  name: string;
  doc: string;
  uploadedBy: string;
  uploadedDate: string;
}

interface AdditionalDocument {
  documentDescription: string;
  file?: File;
  status: number; // 0: pending, 1: uploaded
}

@Component({
  selector: 'app-documents-upload',
  standalone: false,
  templateUrl: './documents-upload.component.html',
  styleUrl: './documents-upload.component.scss',
})
export class DocumentsUploadComponent implements OnInit {
  @Input() applicationId: string | undefined;

  showLoader: boolean = false;
  download: string = '/assets/downloads.png';
  representative: FileData[] = [];
  kycDocuments: any[] = [];
  files: FileData[] = [];

  // Flags for enabling/disabling uploads
  isQuestion14Complete: boolean = false;
  disableMandatoryUploads: boolean = false;

  // Additional supporting documents array
  additionalDocuments: AdditionalDocument[] = [];

  // Mapping for progress (mandatory documents: POA and POI)
  requiredMapping = {
    POA: ['documentPath'],
    POI: ['documentPath'],
  };

  // Fixed document upload variables
  selectedFixedFile: File | null = null;
  selectedFixedDocType: string | null = null;

  // Additional document upload variables
  selectedAdditionalFile: File | null = null;
  selectedAdditionalIndex: number | null = null;
  additionalDialogVisible: boolean = false;
  additionalUploadProgress: number = -1;

  constructor(
    private readonly messageService: MessageService,
    private readonly saveApplicationService: SaveApplicationService,
    private readonly progressService: FormProgressService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.fetchUserApplication();
  }

  onFixedSelect(event: any, docType: string): void {
    // event.files is a single File, not an array
    const file: File = event.files[0];
    if (file.type !== 'application/pdf') {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid File Type',
        detail: 'Only PDF files are allowed!',
      });
      const fileUpload = document.querySelector('p-fileupload') as any;
      if (fileUpload?.clear) {
        fileUpload.clear();
      }
      return;
    }
    // Store file and docType, then show confirmation dialog
    this.selectedFixedFile = file;
    this.selectedFixedDocType = docType;
  }

  onFixedClear(event: any, docType: string): void {
    // Optional: Clear fixed selection if needed
    this.selectedFixedFile = null;
    this.selectedFixedDocType = null;
  }

  async uploadFixedFile(): Promise<void> {
    if (!this.selectedFixedFile || !this.selectedFixedDocType) {
      return;
    }
    this.showLoader = true;

    const formData = new FormData();
    formData.append('file', this.selectedFixedFile);
    formData.append('applicationId', this.applicationId ?? '');
    formData.append('docType', this.selectedFixedDocType);

    // Reset progress before uploading
    try {
      const response: any = await firstValueFrom(
        this.saveApplicationService.uploadFile(formData)
      );

      // Update the document reference in KYC based on uploaded document type
      if (response?.success) {
        await this.fetchUserApplication();
        this.messageService.add({
          severity: 'success',
          summary: 'File Uploaded',
          detail: 'Document added successfully',
        });
        // Mark upload as complete and reset form
        this.clearFixedSelection();
      }
    } catch (error: any) {
      // Handle upload failure
      this.messageService.add({
        severity: 'error',
        summary: 'Upload Failed',
        detail: error.error?.message || 'File upload failed. Please try again.',
      });
    } finally {
      this.showLoader = false;
    }
  }

  cancelFixedUpload(): void {
    this.clearFixedSelection();
  }

  clearFixedSelection(): void {
    this.selectedFixedFile = null;
    this.selectedFixedDocType = null;
    const fileUpload = document.querySelector('p-fileupload') as any;
    if (fileUpload?.clear) {
      fileUpload.clear();
    }
  }

  // ---------------------------
  // Additional Document Upload Methods
  // ---------------------------
  // When a file is selected from the p-fileupload control.
  // When a file is selected in the p-fileupload control.
  onAdditionalSelect(event: any, index: number): void {
    const selected = event.files[0];
    if (selected.type !== 'application/pdf') {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid File Type',
        detail: 'Only PDF files are allowed!',
      });
      const fileUpload = document.querySelector('p-fileupload') as any;
      if (fileUpload?.clear) {
        fileUpload.clear();
      }
      return;
    }
    // Ensure the document identifier is provided.
    if (
      !this.additionalDocuments[index].documentDescription ||
      this.additionalDocuments[index].documentDescription.trim() === ''
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Identifier',
        detail: 'Document identifier is required for additional documents.',
      });
      const fileUpload = document.querySelector('p-fileupload') as any;
      if (fileUpload?.clear) {
        fileUpload.clear();
      }
      return;
    }
    // Store the file in the corresponding additional document row.
    this.additionalDocuments[index].file = selected;
  }

  // When the file selection is cleared.
  onAdditionalClear(event: any, index: number): void {
    if (this.additionalDocuments[index]) {
      this.additionalDocuments[index].file = undefined;
    }
  }

  // Upload the selected file for a specific additional document row.
  async uploadAdditionalDocument(index: number): Promise<void> {
    const doc = this.additionalDocuments[index];
    if (!doc || !doc.file) {
      this.messageService.add({
        severity: 'error',
        summary: 'Upload Error',
        detail: 'No file selected for upload.',
      });
      return;
    }
    // Validate that a document identifier is provided.
    if (!doc.documentDescription || doc.documentDescription.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Identifier',
        detail: 'Document identifier is required for additional documents.',
      });
      return;
    }

    this.showLoader = true;
    const formData = new FormData();
    formData.append('file', doc.file);
    formData.append('applicationId', this.applicationId ?? '');
    formData.append('docType', 'additional'); // Fixed for additional documents.
    // Use the documentDescription as the identifier.
    formData.append('documentIdentifier', doc.documentDescription);

    try {
      const response: any = await firstValueFrom(
        this.saveApplicationService.uploadFile(formData)
      );
      if (response?.success) {
        // After a successful upload, re-fetch the application data to update your table.
        await this.fetchUserApplication();
        this.messageService.add({
          severity: 'success',
          summary: 'File Uploaded',
          detail: 'Additional document uploaded successfully',
        });
      }
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Upload Failed',
        detail: error.error?.message || 'File upload failed. Please try again.',
      });
    } finally {
      this.showLoader = false;
    }
  }

  cancelAdditionalUpload(): void {
    this.additionalDialogVisible = false;
    this.clearAdditionalSelection();
  }

  clearAdditionalSelection(): void {
    this.selectedAdditionalFile = null;
    this.selectedAdditionalIndex = null;
    const fileUpload = document.querySelector('p-fileupload') as any;
    if (fileUpload?.clear) {
      fileUpload.clear();
    }
  }

  async viewDocument(filePath: string) {
    if (!filePath) {
      this.messageService.add({
        severity: 'error',
        summary: 'Attachment Not Found',
        detail: 'No attachment available to view.',
        life: 3000,
      });
      return;
    }

    this.showLoader = true;

    try {
      // Ensure this call is using GET if the controller expects it.
      const response: any = await firstValueFrom(
        this.saveApplicationService.viewFile(filePath)
      );

      // Validate the response
      if (!response?.data?.base64Content) {
        throw new Error('No base64 content received.');
      }

      const { base64Content, contentType } = response.data;
      const byteCharacters = atob(base64Content);
      const byteNumbers = Array.from(byteCharacters, (char) =>
        char.charCodeAt(0)
      );
      const byteArray = new Uint8Array(byteNumbers);

      // Use provided content type, or fallback
      const mimeType = contentType || 'application/octet-stream';
      const blob = new Blob([byteArray], { type: mimeType });

      // Create an object URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Open the file in a new tab
      window.open(url, '_blank');

      // Revoke the Object URL after a sufficient delay (e.g., 5000ms)
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error('Error fetching attachment:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unable to view the attachment. Please try again.',
        life: 3000,
      });
    } finally {
      this.showLoader = false;
    }
  }

  async deleteFixedDocument(filePath: string): Promise<void> {
    this.confirmationService.confirm({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete this document?`,
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check me-2',
      rejectIcon: 'pi pi-times me-2',
      rejectButtonStyleClass: 'p-button-sm me-1',
      acceptButtonStyleClass: 'p-button-outlined p-button-sm me-1',

      accept: async () => {
        this.showLoader = true;
        const body = {
          applicationId: this.applicationId!,
          filePath: filePath,
        };

        try {
          const response: any = await firstValueFrom(
            this.saveApplicationService.deleteFile(body)
          );
          // Check if the deletion was successful
          await this.fetchUserApplication();
          if (response?.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'File Deleted',
              detail:
                response.message || 'Document has been deleted successfully',
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: response?.message || 'Failed to delete document.',
            });
          }
        } catch (error: any) {
          this.messageService.add({
            severity: 'error',
            summary: 'Delete Failed',
            detail: error.error?.message || 'Failed to delete document.',
          });
        } finally {
          this.showLoader = false;
        }
      },

      reject: () => {
        this.confirmationService.close();
        this.messageService.add({
          severity: 'info',
          summary: 'Deletion Cancelled',
          detail: 'Document deletion has been cancelled.',
        });
      },
    });
  }

  // ---------------------------
  // Other Methods
  // ---------------------------
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
        if (appData.kycDocuments && Array.isArray(appData.kycDocuments)) {
          this.kycDocuments = appData.kycDocuments.map((doc: any) => ({
            documentType: doc.documentType,
            documentIdentifier: doc.documentIdentifier,
            documentPath: doc.documentPath || '',
            status: doc.status || 0,
          }));
        } else {
          this.kycDocuments = [
            {
              documentType: 'POA',
              documentIdentifier: 'Registration Certificate',
              documentPath: '',
              status: 0,
            },
            {
              documentType: 'POI',
              documentIdentifier: 'Certificate of Incorporation/ Formation',
              documentPath: '',
              status: 0,
            },
          ];
        }

        // Create mandatory documents object for progress
        const mandatoryDocs: { [key: string]: any } = {};
        this.kycDocuments.forEach((doc) => {
          const type = doc.documentType.toUpperCase();
          if (type === 'POA' || type === 'POI') {
            mandatoryDocs[type] = doc;
          }
        });
        this.disableMandatoryUploads = !(
          mandatoryDocs['POA']?.documentType &&
          mandatoryDocs['POA'].documentIdentifier &&
          mandatoryDocs['POI']?.documentType &&
          mandatoryDocs['POI'].documentIdentifier
        );
        this.isQuestion14Complete = !this.disableMandatoryUploads;
        this.progressService.updateComponentProgress(
          'annexureForm',
          mandatoryDocs,
          this.requiredMapping
        );

        // Map additional documents: Filter those with documentType "additional" and map them to additionalDocuments array.
        this.additionalDocuments = this.kycDocuments
          .filter((doc) => doc.documentType.toLowerCase() === 'additional')
          .map((doc) => ({
            documentDescription: doc.documentIdentifier, // using identifier as description; adjust as needed
            status: doc.status,
            // Optionally, if you want to display the file path, you can add:
            documentPath: doc.documentPath,
          }));
      }
    } catch (error) {
      console.error('Error fetching user application:', error);
    } finally {
      this.showLoader = false;
    }
  }

  getKycDocument(docType: string): any {
    return (
      this.kycDocuments.find((doc) => doc.documentType === docType) || {
        documentIdentifier: 'Pending',
      }
    );
  }

  // Additional Documents Methods
  addAdditionalDocument(): void {
    if (
      this.additionalDocuments.length === 0 ||
      this.additionalDocuments[this.additionalDocuments.length - 1].status === 1
    ) {
      this.additionalDocuments.push({ documentDescription: '', status: 0 });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Incomplete Document',
        detail:
          'Please complete the upload for the current additional document before adding another.',
      });
    }
  }

  canAddAdditionalDocument(): boolean {
    if (this.additionalDocuments.length === 0) {
      return true;
    }
    return (
      this.additionalDocuments[this.additionalDocuments.length - 1].status === 1
    );
  }
}
