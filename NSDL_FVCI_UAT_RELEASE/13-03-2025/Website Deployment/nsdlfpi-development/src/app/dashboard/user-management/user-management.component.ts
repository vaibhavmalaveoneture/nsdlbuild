import { Component, ViewChild, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { FormControl, FormGroup } from '@angular/forms';
import { AdminService } from '../../../swagger';
import { firstValueFrom } from 'rxjs';
import { UserSyncService } from '../../services/user-sync.service';

interface UserRegistrations {
  ur_id: number;
  user_name_fpi_app: string;
  email_id: string;
  number: string;
  created_dtm: string;
  gc_name_of_user: string | undefined;
  verification_flag: number;
  statusText?: string; // Mapped property for display
}

interface UserProfile {
  user_id: number;
  user_name: string;
  email_id: string;
  contact_no: string;
  address: string;
  role_id: string | undefined;
  dp_id: number;
  status?: string; // Mapped property for display
}

@Component({
  standalone: false,
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent {
  @ViewChild('dt1') dt1!: Table;

  showLoader = false;
  sidebarCollapsed: boolean = false; // Add property for sidebar state

  crumbItems: MenuItem[] | undefined;
  userList: UserRegistrations[] = [];
  filteredUserList: UserRegistrations[] = [];
  selectedUser: UserRegistrations | undefined;
  first = 0;
  userRoleId: number | null = null;
  userPermissions: string[] = [];

  downloadItems!: MenuItem[];

  userProfile!: UserProfile;
  // Store user profile details
  userRegistrations = {
    userId: null,
    userName: '',
    email: '',
    contactNo: '',
    address: '',
    roleId: null,
    status: null,
    createdAt: '',
    lastLogin: '',
    lastPwdChange: '',
    entityName: '',
    dob: '',
    panNumber: '',
    allowOtp: false,
    otpCount: 0,
  };

  searchForm = new FormGroup({
    query: new FormControl(''),
    dateRange: new FormControl<Date[] | null>(null),
  });

  constructor(
    private readonly userSyncService: UserSyncService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly adminService: AdminService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadUserRegistrationsList();
    this.crumbItems = [
      { label: 'User Management', route: '/user-management' },
      { label: 'List of users', route: '/user-management' },
    ];

    this.downloadItems = [
      {
        label: 'CSV',
        icon: 'pi pi-file',
        command: () => {
          this.exportCSV();
        },
      },
      {
        label: 'XLSX',
        icon: 'pi pi-file-excel',
        command: () => {
          this.exportXLSX();
        },
      },
    ];
    // Restore sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.sidebarCollapsed = savedState === 'true';
    }
  }

  // Add method to handle sidebar toggle
  onSidebarToggled(isToggled: boolean) {
    this.sidebarCollapsed = isToggled;
    // No need to save to localStorage here as the sidebar component already does that
  }

  async loadProfile() {
    try {
      this.showLoader = true;

      // Fetch user profile
      const profileResponse =
        await this.userSyncService.validateSessionAndGetProfile();
      if (!profileResponse) {
        throw new Error('Failed to retrieve user profile');
      }

      this.userRoleId = profileResponse.data.role_id;
      this.userProfile = { ...profileResponse.data };

      // Fetch user permissions
      this.userPermissions = await this.userSyncService.getUserPermissions();
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      this.showLoader = false;
    }
  }

  hasPermission(permission: string): boolean {
    return this.userPermissions?.includes(permission.toLowerCase());
  }

  async loadUserRegistrationsList() {
    this.showLoader = true;
    try {
      const response = await firstValueFrom(
        this.adminService.apiAdminUserRegistrationsGet()
      );
      if (response?.success) {
        const statusMapping: { [key: number]: string } = {
          0: 'Pending Email Verification',
          1: 'Pending For Approval',
          2: 'Approved',
          3: 'Rejected',
        };

        this.userList = response.data.map((user: UserRegistrations) => ({
          ...user,
          statusText: statusMapping[user.verification_flag] || 'Unknown',
          created_dtm: new Date(user.created_dtm),
        }));
        this.filteredUserList = [...this.userList];
      }
    } catch (error) {
      console.error('Error loading user registrations:', error);
    } finally {
      this.showLoader = false;
    }
  }

  onApprove(user: UserRegistrations): void {
    this.confirmationService.confirm({
      header: `Approve User`,
      message: `<p class="confirm-text">Are you sure you want to <b>approve</b> this user?</p>
                <p class="confirm-user"><b>Name:</b> ${user.user_name_fpi_app}</p>
                <p class="confirm-user"><b>Email:</b> <i>${user.email_id}</i></p>`,
      icon: 'pi pi-check',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass:
        'p-button-sm p-button-outlined p-button-success me-2',
      rejectButtonStyleClass: 'p-button-sm p-button-secondary',

      accept: () => {
        this.approveRejectUser(user, true);
      },
    });
  }

  onReject(user: UserRegistrations): void {
    this.confirmationService.confirm({
      header: `Reject User`,
      message: `<p class="confirm-text">Are you sure you want to <b>reject</b> this user?</p>
                <p class="confirm-user"><b>Name:</b> ${user.user_name_fpi_app}</p>
                <p class="confirm-user"><b>Email:</b> <i>${user.email_id}</i></p>`,
      icon: 'pi pi-times',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass:
        'p-button-sm p-button-outlined p-button-danger me-2',
      rejectButtonStyleClass: 'p-button-sm p-button-secondary',

      accept: () => {
        this.approveRejectUser(user, false);
      },
    });
  }

  async approveRejectUser(
    user: UserRegistrations,
    approve: boolean
  ): Promise<void> {
    this.showLoader = true;
    try {
      // Call your backend API to approve the user
      const response = await firstValueFrom(
        this.adminService.apiAdminApproveUserPost({ urId: user.ur_id, approve })
      );
      if (response?.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `User ${approve ? 'approved' : 'rejected'} successfully.`,
        });

        this.loadUserRegistrationsList();
      } else {
        console.error('Approval failed:', response?.message);
      }
    } catch (error) {
      console.error('Error approving user:', error);
    } finally {
      this.showLoader = false;
    }
  }

  onSearch() {
    const { dateRange, query } = this.searchForm.value;
    this.filteredUserList = [...this.userList];

    if (dateRange?.[0] && dateRange?.[1]) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      this.filteredUserList = this.filteredUserList.filter((user) => {
        const createdDate = new Date(user.created_dtm);
        return createdDate >= startDate && createdDate <= endDate;
      });
    }

    if (query && query.trim() !== '') {
      const searchQuery = query.toLowerCase();
      this.filteredUserList = this.filteredUserList.filter(
        (user) =>
          user.user_name_fpi_app.toLowerCase().includes(searchQuery) ||
          user.email_id.toLowerCase().includes(searchQuery) ||
          user.number?.toLowerCase().includes(searchQuery)
      );
    }
  }

  onReset() {
    this.searchForm.reset({
      query: '',
      dateRange: null,
    });
    this.filteredUserList = [...this.userList];
    this.dt1.reset();
  }

  onGlobalFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUserList = this.userList.filter(
      (user) =>
        user.user_name_fpi_app.toLowerCase().includes(filterValue) ||
        user.email_id.toLowerCase().includes(filterValue) ||
        user.number?.toLowerCase().includes(filterValue)
    );
  }

  getSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | undefined {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warn';
      case 'suspended':
        return 'danger';
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

  exportCSV() {
    let csv = 'S.No,Name,Email,Mobile,Created At,Status\n';
    this.filteredUserList.forEach((row, index) => {
      const name = row.user_name_fpi_app || row.gc_name_of_user;
      const email = row.email_id;
      const mobile = row.number ? row.number : 'N/A';
      const createdAt = this.formatDateForExport(new Date(row.created_dtm));
      const status = row.statusText;
      // Wrap text values in quotes in case they contain commas.
      csv += `${
        index + 1
      },"${name}","${email}","${mobile}","${createdAt}","${status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.getExportFileName('csv');
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportXLSX() {
    // Build an XML Spreadsheet (Excel 2003 XML) document.
    let xml = `<?xml version="1.0"?>\n`;
    xml += `<?mso-application progid="Excel.Sheet"?>\n`;
    xml += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
            xmlns:html="http://www.w3.org/TR/REC-html40">\n`;
    xml += `<Worksheet ss:Name="Sheet1">\n<Table>\n`;

    // Header row
    xml += `<Row>\n`;
    xml += `<Cell><Data ss:Type="String">S.No</Data></Cell>\n`;
    xml += `<Cell><Data ss:Type="String">Name</Data></Cell>\n`;
    xml += `<Cell><Data ss:Type="String">Email</Data></Cell>\n`;
    xml += `<Cell><Data ss:Type="String">Mobile</Data></Cell>\n`;
    xml += `<Cell><Data ss:Type="String">Created At</Data></Cell>\n`;
    xml += `<Cell><Data ss:Type="String">Status</Data></Cell>\n`;
    xml += `</Row>\n`;

    // Data rows
    this.filteredUserList.forEach((row, index) => {
      const name = row.user_name_fpi_app || row.gc_name_of_user;
      const email = row.email_id;
      const mobile = row.number ? row.number : 'N/A';
      const createdAt = this.formatDateForExport(new Date(row.created_dtm));
      const status = row.statusText;

      xml += `<Row>\n`;
      xml += `<Cell><Data ss:Type="Number">${index + 1}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${this.escapeXml(
        name!
      )}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${this.escapeXml(
        email
      )}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${this.escapeXml(
        mobile
      )}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${this.escapeXml(
        createdAt
      )}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${this.escapeXml(
        status!
      )}</Data></Cell>\n`;
      xml += `</Row>\n`;
    });

    xml += `</Table>\n</Worksheet>\n</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.getExportFileName('xls'); // Standard file name with .xls extension
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private escapeXml(unsafe: string): string {
    // Simple XML escape function
    return unsafe.replace(/[<>&'"]/g, function (c) {
      switch (c) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '&':
          return '&amp;';
        case "'":
          return '&apos;';
        case '"':
          return '&quot;';
        default:
          return c;
      }
    });
  }

  private formatDateForExport(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${dd}/${MM}/${yyyy} ${hh}:${mm}:${ss}`;
  }
  private getExportFileName(extension: string): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `User_Registrations_${yyyy}${MM}${dd}_${hh}${mm}${ss}.${extension}`;
  }
}
