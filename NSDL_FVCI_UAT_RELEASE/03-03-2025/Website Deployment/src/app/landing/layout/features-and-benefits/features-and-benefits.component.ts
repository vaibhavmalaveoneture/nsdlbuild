import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-features-and-benefits',
  standalone: false,
  templateUrl: './features-and-benefits.component.html',
  styleUrl: './features-and-benefits.component.scss'
})
export class FeaturesAndBenefitsComponent {
features: string = '/assets/features.png';
  currentDate: string;
  currentFY: string;

  constructor(private datePipe: DatePipe) {
    this.currentDate = this.datePipe.transform(new Date(), 'MMMM d, yyyy') || '';
    this.currentFY = this.getCurrentFinancialYear();
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
}
