import { Component } from '@angular/core';

export interface FaqItem {
  title: string;
  slug: string;
}

@Component({
  selector: 'app-faq',
  standalone: false,
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  lastUpdated = '30-JUN-2016';

  faqItems: FaqItem[] = [
    {
      title: 'Transition from FII to FPI Regime',
      slug: 'fii-to-fpi',
    },
    {
      title: 'Transition from QFI to FPI Regime',
      slug: 'qfi-to-fpi',
    },
    {
      title: 'Eligibility of FPIs',
      slug: 'eligibility',
    },
    {
      title: 'Responsibilities of Designated Depository Participant (DDP)',
      slug: 'ddp-responsibilities',
    },
    {
      title: 'Generation of FPI registration certificate',
      slug: 'registration-certificate',
    },
    {
      title: 'Payment of Fees by FPI',
      slug: 'payment-fees',
    },
    {
      title: 'Clubbing of Investment Limits',
      slug: 'investment-limits',
    },
    {
      title: 'FPI Investments in Debt Securities',
      slug: 'debt-securities',
    },
    {
      title: 'Offshore Derivative Instruments (ODIs)',
      slug: 'odis',
    },
    {
      title: 'Replies to Additional Queries received from DDPs',
      slug: 'additional-queries',
    },
  ];
}
