import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { UserSyncService } from '../../../services/user-sync.service';
import { LoaderComponent } from '../../loader/loader.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    MenubarModule,
    LoaderComponent,
    RouterLink,
    AvatarModule,
    OverlayBadgeModule,
    ButtonModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  showLoader: boolean = false;
  items: MenuItem[] | undefined;
  nsdl: string = '/assets/nsdl_logo.png';
  userName: string = 'John Doe';
  email: string = 'john@doe.com';
  loginTime: string = new Date().toLocaleString();

  constructor(private readonly userSyncService: UserSyncService) {}

  async ngOnInit() {
    try {
      const profile = await this.userSyncService.validateSessionAndGetProfile();

      if (!profile || !profile.data) {
        throw new Error('Failed to retrieve user profile');
      }

      const { user_nm, email_id, login_dtm } = profile.data;

      this.items = [
        {
          label: 'Home',
        },
        {
          label: 'Profile',
          icon: 'pi pi-user',
          items: [
            {
              label: `User: ${user_nm || 'N/A'}`,
              escape: false,
            },
            {
              label: `Email: ${email_id || 'N/A'}`,
            },
            {
              label: `Last Login: ${
                login_dtm ? new Date(login_dtm).toLocaleString() : 'N/A'
              }`,
            },
            {
              label: 'Logout',
              icon: 'pi pi-sign-out',
              command: () => this.onLogout(),
            },
          ],
        },
      ];
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async onLogout() {
    this.showLoader = true;
    try {
      await this.userSyncService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.showLoader = false;
    }
  }
}
