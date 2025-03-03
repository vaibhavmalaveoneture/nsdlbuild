import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { FPI, fpiData } from '../new-application/data';
import { UserSyncService } from '../../services/user-sync.service';
import { FvciApplicationService } from '../../../swagger';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SaveApplicationService } from '../../services/save-application.service';

export interface FvciApplicationMaster {
  applicationId?: string;
  name?: string;
  fvciRegistrationNumber?: string;
  createdAt: string; // ISO date string, e.g., "2025-02-28T00:00:00Z"
  updatedAt: string; // ISO date string
  status?: number;
}

@Component({
  selector: 'app-application-list',
  standalone: false,
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss',
})
export class ApplicationListComponent {
  @ViewChild('dt1') dt1!: Table;

  showLoader: boolean = false;

  crumbItems: MenuItem[] | undefined;
  fpiList: FvciApplicationMaster[] = [];
  filteredFpiList: FvciApplicationMaster[] = [];
  selectedFPI: FPI | undefined;
  first = 0;

  searchForm = new FormGroup({
    query: new FormControl(''),
    dateRange: new FormControl<Date[] | null>(null),
  });
  contactNumber: string = 'N/A';
  email: string = 'N/A';

  constructor(
    private readonly router: Router,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
    private readonly userSyncService: UserSyncService,
    private readonly saveApplicationService: SaveApplicationService,
    private readonly fvciApplicationService: FvciApplicationService,
    private readonly datePipe: DatePipe
  ) {}

  async ngOnInit() {
    await this.loadUserProfile();
    this.initializeBreadcrumbs();
    this.loadUserApplications();
  }

  confirmNewApplication() {
    this.confirmationService.confirm({
      header: 'Create New Application',
      message: `
      <div style="line-height: 1.4;">
        <p>Creating a new application will start a fresh submission process. Once created, you can fill out the required details and track its status in your dashboard.</p>
        <p>Are you sure you want to continue?</p>
      </div>
    `,
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check me-2',
      rejectIcon: 'pi pi-times me-2',
      rejectButtonStyleClass: 'p-button-sm me-1',
      acceptButtonStyleClass: 'p-button-outlined p-button-sm me-1',
      accept: async () => {
        // Call the API to create a new application with a blank DTO
        const newApplicationId =
          await this.saveApplicationService.createNewApplication();
        if (newApplicationId) {
          // Navigate to the new application component with the generated applicationId
          this.router.navigate(['/dashboard/new-application'], {
            queryParams: { applicationId: newApplicationId },
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create a new application. Please try again.',
          });
        }
      },
      reject: () => {
        this.confirmationService.close();
        this.messageService.add({
          severity: 'info',
          summary: 'Action Cancelled',
          detail: 'Creation of the new application was cancelled.',
        });
      },
    });
  }

  onEdit(fpi: any): void {
    if (fpi?.applicationId) {
      // Prepare fields
      const registrationNumber = fpi.fvciRegistrationNumber || 'Draft Pending';
      const fpiName = fpi.name || 'N/A';
      const formattedCreatedAt = fpi.createdAt
        ? this.datePipe.transform(fpi.createdAt, 'dd/MM/yyyy')
        : 'N/A';

      // Build an HTML-based message for a better look
      const confirmMessage = `
        <div style="line-height: 1.4;">
          <p style="margin-top: 1rem;">
            Do you want to proceed with <strong>editing</strong> this application?
          </p>
          <ul style="list-style-type: none; padding-left: 0; margin: 0;">
            <li><strong>FPI Name:</strong> ${fpiName}</li>
            <li><strong>Registration No:</strong> ${registrationNumber}</li>
            <li><strong>Created At:</strong> ${formattedCreatedAt}</li>
          </ul>
          
        </div>
      `;

      this.confirmationService.confirm({
        header: 'Confirm Edit Application',
        message: confirmMessage,
        icon: 'pi pi-exclamation-triangle',
        // Customize button labels and appearance
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        acceptIcon: 'pi pi-check',
        rejectIcon: 'pi pi-times',
        acceptButtonStyleClass: 'p-button-success p-button-sm me-2',
        rejectButtonStyleClass:
          'p-button-outlined p-button-sm p-button-secondary me-2',
        // Actions
        accept: () => {
          this.router.navigate(['/dashboard/new-application'], {
            queryParams: { applicationId: fpi.applicationId },
          });
        },
        reject: () => {
          this.confirmationService.close();
          this.messageService.add({
            severity: 'info',
            summary: 'Edit Cancelled',
            detail: 'You cancelled the edit action.',
          });
        },
      });
    }
  }

  // Method to handle redirection for viewing an application.
  // This will navigate to the 'view-application' route with the applicationId.
  onView(fpi: any): void {
    if (fpi?.applicationId) {
      this.router.navigate(['dashboard/view-application', fpi.applicationId]);
    }
  }

  private async loadUserProfile() {
    this.showLoader = true;
    try {
      const profile = await this.userSyncService.validateSessionAndGetProfile();
      const userData = profile?.data || {};

      this.contactNumber = userData.contact_no || 'N/A';
      this.email = userData.email_id || 'N/A';
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      this.showLoader = false;
    }
  }

  private initializeBreadcrumbs() {
    this.crumbItems = [
      { label: 'FPI Monitor', route: '/new-application' },
      { label: 'List of FPI', route: '/application-list' },
    ];
  }

  private async loadUserApplications() {
    this.showLoader = true;
    try {
      const response = await firstValueFrom(
        this.fvciApplicationService.apiFvciGetApplicationListAsyncGet()
      );
      if (response?.success) {
        this.fpiList = this.filteredFpiList = response.data;
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      this.showLoader = false;
    }
  }

  onSearch() {
    const { dateRange, query } = this.searchForm.value;

    // Start with a copy of the complete list.
    this.filteredFpiList = [...this.fpiList];

    // Date range filtering using the createdAt property.
    if (dateRange && Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      this.filteredFpiList = this.filteredFpiList.filter((fpi) => {
        const createdDate = new Date(fpi.createdAt);
        return createdDate >= startDate && createdDate <= endDate;
      });
    }

    // Text query filtering.
    if (query) {
      const searchQuery = query.toLowerCase();
      this.filteredFpiList = this.filteredFpiList.filter(
        (fpi) =>
          fpi.fvciRegistrationNumber?.toLowerCase().includes(searchQuery) ||
          fpi.name?.toLowerCase().includes(searchQuery) ||
          // Convert createdAt and updatedAt to a string in any format; here we simply use toString()
          fpi.createdAt.toString().toLowerCase().includes(searchQuery) ||
          fpi.updatedAt.toString().toLowerCase().includes(searchQuery) ||
          fpi.status?.toString().toLowerCase().includes(searchQuery)
      );
    }
  }

  onReset() {
    this.searchForm.reset({
      query: '',
      dateRange: null,
    });
    this.filteredFpiList = [...this.fpiList];
    this.dt1.reset();
  }

  onGlobalFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dt1.filterGlobal(filterValue, 'contains');
  }

  getSeverity(status: string): 'success' | 'info' | 'danger' | undefined {
    switch (status) {
      case 'registered':
        return 'success';
      case 'invalid':
        return 'danger';
      case 'expired':
        return 'info';
      default:
        return undefined;
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
