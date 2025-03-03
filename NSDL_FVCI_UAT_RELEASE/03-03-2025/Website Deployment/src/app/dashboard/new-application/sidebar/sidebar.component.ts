import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { UserSyncService } from '../../../services/user-sync.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  isToggled = false;

  toggleSidebar() {
    this.isToggled = !this.isToggled;
  }

  items!: MenuItem[];

  private readonly router = inject(Router);

  constructor(private readonly userSyncService: UserSyncService) {}

  ngOnInit() {
    this.loadItems();
  }

  async loadItems(): Promise<void> {
    try {
      const userPermissions: string[] =
        (await this.userSyncService.getUserPermissions()) || [];

      this.items = [
        {
          label: 'FVCI Application',
          expanded: true,
          items: [
            {
              label: 'List Of Application',
              icon: 'pi pi-th-large',
              route: '/dashboard/application-list',
            },
            // {
            //   label: 'New Application',
            //   icon: 'pi pi-objects-column',
            //   route: '/dashboard/new-application',
            // },
          ],
        },
        ...this.getUserManagementItems(userPermissions),
      ];
    } catch (error) {
      console.error('❌ Error loading sidebar items:', error);
    }
  }

  private getUserManagementItems(userPermissions: string[]): any[] {
    if (!userPermissions.includes('view_users')) return [];

    return [
      {
        label: 'User Management',
        expanded: true,
        items: [
          {
            label: 'Auth Registration',
            icon: 'pi pi-user-plus',
            route: '/dashboard/user-management',
          },
        ],
      },
    ];
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  visible: boolean = true;
}
