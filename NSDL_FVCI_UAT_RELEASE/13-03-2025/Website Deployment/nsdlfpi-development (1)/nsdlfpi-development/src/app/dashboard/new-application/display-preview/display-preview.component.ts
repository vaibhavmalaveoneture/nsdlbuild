import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { SaveApplicationService } from '../../../services/save-application.service';
import {
  DraftFvciApplicationDto,
  FvciApplicationService,
} from '../../../../swagger';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface AdditionalDocument {
  documentDescription: string;
  documentPath?: string;
  status: number; // 0: pending, 1: uploaded
}

@Component({
  selector: 'app-display-preview',
  standalone: false,
  templateUrl: './display-preview.component.html',
  styleUrl: './display-preview.component.scss',
})
export class DisplayPreviewComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() applicationId: string | undefined;
  @Output() visibleChange = new EventEmitter<boolean>();

  applicationData: DraftFvciApplicationDto | null = null;
  isLoading: boolean = false;
  
  // Document related properties
  kycDocuments: any[] = [];
  additionalDocuments: AdditionalDocument[] = [];

  constructor(
    private saveApplicationService: SaveApplicationService,
    private fvciService: FvciApplicationService,
    private messageService: MessageService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // When initially rendered, don't fetch data
    console.log('Preview Init');
  }

  async loadApplicationData() {
    if (!this.applicationId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Application ID is missing. Cannot display preview.',
      });
      this.onHide();
      return;
    }

    this.isLoading = true;

    try {
      const response =
        await this.saveApplicationService.fetchExistingApplication(
          this.applicationId
        );

      if (response && response.success) {
        this.applicationData = response.data;
        
        // Process KYC documents
        if (this.applicationData && this.applicationData.kycDocuments && Array.isArray(this.applicationData.kycDocuments)) {
          this.kycDocuments = this.applicationData.kycDocuments.map((doc: any) => ({
            documentType: doc.documentType,
            documentIdentifier: doc.documentIdentifier,
            documentPath: doc.documentPath || '',
            status: doc.status || 0,
          }));
          
          // Extract additional documents
          this.additionalDocuments = this.kycDocuments
            .filter((doc) => doc.documentType.toLowerCase() === 'additional')
            .map((doc) => ({
              documentDescription: doc.documentIdentifier,
              documentPath: doc.documentPath,
              status: doc.status,
            }));
        }
        
        console.log('Preview data loaded successfully');
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch application data for preview',
        });
        this.onHide();
      }
    } catch (error) {
      console.error('Error fetching application data:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred while loading preview data',
      });
      this.onHide();
    } finally {
      this.isLoading = false;
    }
  }

  getKycDocument(docType: string): any {
    return (
      this.kycDocuments.find((doc) => doc.documentType === docType) || {
        documentIdentifier: 'Pending',
      }
    );
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

    this.isLoading = true;

    try {
      // Ensure this call is using GET if the controller expects it
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
      this.isLoading = false;
    }
  }

  onHide() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    // Clear data when modal is closed
    this.applicationData = null;
    this.kycDocuments = [];
    this.additionalDocuments = [];
  }

  // This will be called whenever the dialog becomes visible
  async onShow() {
    await this.loadApplicationData();
  }
}