// import { Component, OnInit } from '@angular/core';
// import { DashboardService } from '../../../services/dashboard.service';

// @Component({
//   selector: 'app-hero-section',
//   standalone: false,
//   templateUrl: './hero-section.component.html',
//   styleUrl: './hero-section.component.scss',
// })
// export class HeroSectionComponent implements OnInit {
//   hero: string = '/assets/hero.png';

//   // Default country flag images (fallback)
//   c1: string = '/assets/cif_rom.png';
//   c2: string = '/assets/cif_arg.png';
//   c3: string = '/assets/cif_aus.png';
//   c4: string = '/assets/cif_can.png';
//   c5: string = '/assets/cif_den.png';
//   c6: string = '/assets/cif_ind.png';
//   c7: string = '/assets/cif_hai.png';
//   c8: string = '/assets/cif_hon.png';
//   c9: string = '/assets/cif_egy.png';
//   c10: string = '/assets/cif_iran.png';
//   c11: string = '/assets/cif_hon.png';
//   c12: string = '/assets/cif_afr.png';
//   c13: string = '/assets/cif_rom.png';

//   // Dashboard data
//   totalFPICount: number = 3000; // Default value
//   totalFVCICount: number = 0;
//   countries: { name: string; total_count: number; flag_link: string }[] = [];
//   isLoading: boolean = true;
//   loadError: boolean = false;

//   constructor(private dashboardService: DashboardService) {}

//   ngOnInit(): void {
//     this.fetchDashboardData();
//   }

//   formatNumber(num: number): string {
//     return num.toLocaleString();
//   }

//   private fetchDashboardData(): void {
//     this.dashboardService.getDashboardData()
//       .subscribe({
//         next: (response) => {
//           if (response.success) {
//             // Update FPI and FVCI counts
//             this.totalFPICount = response.data.counts.total_fpi_count;
//             this.totalFVCICount = response.data.counts.total_fvci_count;

//             // Update countries data
//             this.countries = response.data.countries;

//             // Update flag images if available
//             if (this.countries.length > 0) {
//               // Map countries to flag images
//               this.updateCountryFlags();
//             }

//             this.isLoading = false;
//           } else {
//             this.loadError = true;
//             this.isLoading = false;
//           }
//         },
//         error: (error) => {
//           console.error('Error fetching dashboard data:', error);
//           this.loadError = true;
//           this.isLoading = false;
//         }
//       });
//   }

//   /**
//    * Handles image loading errors by setting a fallback image
//    * @param event The error event
//    * @param fallbackSrc The fallback image source URL
//    */
//   onImageError(event: Event, fallbackSrc: string): void {
//     const imgElement = event.target as HTMLImageElement;
//     if (imgElement && imgElement.src) {
//       imgElement.src = fallbackSrc;
//     }
//   }

//   private updateCountryFlags(): void {
//     // Map the country flag links to the c1-c12 variables
//     // This ensures we maintain backward compatibility with the existing template
//     const countryFlags = this.countries.map(country => country.flag_link);

//     // Only update if we have flag links
//     if (countryFlags.length >= 1) this.c1 = "/assets/countries/"+countryFlags[0].toLowerCase()+".svg";
//     if (countryFlags.length >= 2) this.c2 = "/assets/countries/"+countryFlags[1].toLowerCase()+".svg";
//     if (countryFlags.length >= 3) this.c3 = "/assets/countries/"+countryFlags[2].toLowerCase()+".svg";
//     if (countryFlags.length >= 4) this.c4 = "/assets/countries/"+countryFlags[3].toLowerCase()+".svg";
//     if (countryFlags.length >= 5) this.c5 = "/assets/countries/"+countryFlags[4].toLowerCase()+".svg";
//     if (countryFlags.length >= 6) this.c6 = "/assets/countries/"+countryFlags[5].toLowerCase()+".svg";
//     if (countryFlags.length >= 7) this.c7 = "/assets/countries/"+countryFlags[6].toLowerCase()+".svg";
//     if (countryFlags.length >= 8) this.c8 = "/assets/countries/"+countryFlags[7].toLowerCase()+".svg";
//     if (countryFlags.length >= 9) this.c9 = "/assets/countries/"+countryFlags[8].toLowerCase()+".svg";
//     if (countryFlags.length >= 10) this.c10 = "/assets/countries/"+countryFlags[9].toLowerCase()+".svg";
//   }
// }

import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';

interface CountryData {
  name: string;
  total_count: number;
  flag_link: string;
}

@Component({
  selector: 'app-hero-section',
  standalone: false,
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent implements OnInit {
  hero: string = '/assets/hero.png';

  // Default country flag images (fallback)
  c1: string = '/assets/cif_rom.png';
  c2: string = '/assets/cif_arg.png';
  c3: string = '/assets/cif_aus.png';
  c4: string = '/assets/cif_can.png';
  c5: string = '/assets/cif_den.png';
  c6: string = '/assets/cif_ind.png';
  c7: string = '/assets/cif_hai.png';
  c8: string = '/assets/cif_hon.png';
  c9: string = '/assets/cif_egy.png';
  c10: string = '/assets/cif_iran.png';

  // Store the country data for tooltips
  countryData: CountryData[] = [];

  // Dashboard data
  totalFPICount: number = 3000; // Default value
  totalFVCICount: number = 0;
  isLoading: boolean = true;
  loadError: boolean = false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  private fetchDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (response) => {
        if (response.success) {
          // Update FPI and FVCI counts
          this.totalFPICount = response.data.counts.total_fpi_count;
          this.totalFVCICount = response.data.counts.total_fvci_count;

          // Store the country data for tooltips
          this.countryData = response.data.countries;

          // Update flag images if available
          if (this.countryData.length > 0) {
            this.updateCountryFlags();
          }

          this.isLoading = false;
        } else {
          this.loadError = true;
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching dashboard data:', error);
        this.loadError = true;
        this.isLoading = false;
      },
    });
  }

  /**
   * Handles image loading errors by setting a fallback image
   * @param event The error event
   * @param fallbackSrc The fallback image source URL
   */
  onImageError(event: Event, fallbackSrc: string): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && imgElement.src) {
      imgElement.src = fallbackSrc;
    }
  }

  private updateCountryFlags(): void {
    // Map the country flag links to the flag URLs in assets/countries
    if (this.countryData.length >= 1)
      this.c1 =
        '/assets/countries/' +
        this.countryData[0].flag_link.toLowerCase() +
        '.svg';
    if (this.countryData.length >= 2)
      this.c2 =
        '/assets/countries/' +
        this.countryData[1].flag_link.toLowerCase() +
        '.svg';
    if (this.countryData.length >= 3)
      this.c3 =
        '/assets/countries/' +
        this.countryData[2].flag_link.toLowerCase() +
        '.svg';
    if (this.countryData.length >= 4)
      this.c4 =
        '/assets/countries/' +
        this.countryData[3].flag_link.toLowerCase() +
        '.svg';
    if (this.countryData.length >= 5)
      this.c5 =
        '/assets/countries/' +
        this.countryData[4].flag_link.toLowerCase() +
        '.svg';
    if (this.countryData.length >= 6)
      this.c6 =
        '/assets/countries/' +
        this.countryData[5].flag_link.toLowerCase() +
        '.svg';
    if (this.countryData.length >= 7)
      this.c7 =
        '/assets/countries/' +
        this.countryData[6].flag_link.toLowerCase() +
        '.svg';
    if (this.countryData.length >= 8)
      this.c8 =
        '/assets/countries/' +
        this.countryData[7].flag_link.toLowerCase() +
        '.svg';
    if (this.countryData.length >= 9)
      this.c9 =
        '/assets/countries/' +
        this.countryData[8].flag_link.toLowerCase() +
        '.svg';
    if (this.countryData.length >= 10)
      this.c10 =
        '/assets/countries/' +
        this.countryData[9].flag_link.toLowerCase() +
        '.svg';
  }
}
