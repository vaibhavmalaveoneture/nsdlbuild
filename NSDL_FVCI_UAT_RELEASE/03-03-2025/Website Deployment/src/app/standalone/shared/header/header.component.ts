import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenubarModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  items: MenuItem[] | undefined;
  private readonly router = inject(Router);
  nsdl: string = '/assets/nsdl_logo.png';

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        // icon: 'pi pi-home',
        command: () => {
          this.router.navigate(['/']);
        },
      },
      {
        label: 'Reports',
        // icon: 'pi pi-receipt',

        items: [
          {
            label: 'FPI Investments',
            url: 'https://www.fpi.nsdl.co.in/web/Reports/ReportsListing.aspx',
          },
          {
            label: 'Foreign Investment Limit Monitoring',
            url: 'https://www.fpi.nsdl.co.in/web/Reports/ForeignInvestmentLimitMonitoringListing.aspx',
          },
        ],
      },
      // {
      //   label: 'Track your FPI',
      //   icon: 'pi pi-map-marker',
      // },
      // {
      //   label: 'Downloads',
      //   icon: 'pi pi-file',

      //   items: [
      //     {
      //       label: 'Circular',
      //     },
      //     {
      //       label: 'Announcements',
      //     },
      //   ],
      // },
      {
        label: 'Login',
        styleClass: 'login-item',
        command: () => {
          this.router.navigate(['/auth/login']);
        },
      },
      {
        label: 'Register',
        styleClass: 'register-item',
        command: () => {
          this.router.navigate(['/auth/register']);
        },
      },
    ];
  }
}
