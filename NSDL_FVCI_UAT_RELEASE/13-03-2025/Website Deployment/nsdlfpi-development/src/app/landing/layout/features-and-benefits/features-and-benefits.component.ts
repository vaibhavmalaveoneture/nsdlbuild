import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-features-and-benefits',
  standalone: false,
  templateUrl: './features-and-benefits.component.html',
  styleUrl: './features-and-benefits.component.scss'
})
export class FeaturesAndBenefitsComponent implements OnInit {
  features: string = '/assets/features.png';
  currentDate: string;
  currentFY: string;
  
  // FPI count from dashboard
  totalFPICount: number = 0;
  totalFVCICount: number = 0;

  constructor(
    private datePipe: DatePipe,
    private dashboardService: DashboardService
  ) {
    this.currentDate = this.datePipe.transform(new Date(), 'MMMM d, yyyy') || '';
    this.currentFY = this.getCurrentFinancialYear();
  }

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  getCurrentFinancialYear(): string {
    const today = new Date();
    const month = today.getMonth(); // 0-11
    const year = today.getFullYear();
    
    // Financial year starts from April (month 3)
    // If current month is January to March (0-2), it's previous year's FY
    const fyStartYear = month < 3 ? year - 1 : year;
    const fyEndYear = fyStartYear + 1;
    
    // Get the quarter (1-4) based on the month
    let quarter;
    if (month >= 3 && month <= 5) quarter = 1;      // Apr-Jun
    else if (month >= 6 && month <= 8) quarter = 2; // Jul-Sep
    else if (month >= 9 && month <= 11) quarter = 3;// Oct-Dec
    else quarter = 4;                               // Jan-Mar

    return `FY ${fyStartYear}-${String(fyEndYear).slice(2)} Q${quarter}`;
  }

  private fetchDashboardData(): void {
    this.dashboardService.getDashboardData()
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Only update the FPI count
            this.totalFPICount = response.data.counts.total_fpi_count;
            this.totalFVCICount = response.data.counts.total_fvci_count;
            console.log('Dashboard data loaded in features component:', response.data);
          }
        },
        error: (error) => {
          console.error('Error fetching dashboard data:', error);
        }
      });
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }
}