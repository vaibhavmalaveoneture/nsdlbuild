import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

export interface FaqDetailItem {
  question: string;
  answer: string;
}

interface FaqTopicData {
  [key: string]: {
    title: string;
    items: FaqDetailItem[];
  };
}

@Component({
  selector: 'app-faq-detail',
  standalone: false,
  templateUrl: './faq-detail.component.html',
  styleUrls: ['./faq-detail.component.scss'],
})
export class FaqDetailComponent implements OnInit {
  topicSlug: string = '';
  topicTitle: string = '';
  faqDetailItems: FaqDetailItem[] = [];
  lastUpdated = '30-JUN-2016';

  private faqTopicData: FaqTopicData = {
    'fii-to-fpi': {
      title: 'Transition from FII to FPI Regime',
      items: [
        {
          question:
            'Q1. Can the existing Foreign Institutional Investors (FIIs)/Sub Accounts (SA) continue to buy, sell or deal in securities till the expiry of their current registration without payment of conversion fees during the validity of their registration?',
          answer:
            'Yes, they can continue until the expiry of their registration without payment of conversion fees.',
        },
        {
          question:
            'Q2. Whether the original validity of registration as FII/SA will remain the same upon conversion as FPI?',
          answer: 'The original validity remains the same upon conversion.',
        },
        {
          question:
            'Q3. Whether it is mandatory for a SA to convert as FPI, if its FII chooses to convert as FPI?',
          answer: 'Yes, it is mandatory for SA to convert if its FII converts.',
        },
        {
          question:
            'Q4. Whether the existing FIIs and SAs that do not meet the eligibility requirements as stipulated under these regulations, can continue to deal in Indian securities?',
          answer:
            'No, they cannot continue to deal if eligibility requirements are not met.',
        },
        {
          question:
            'Q5. How will the proprietary SAs of FIIs be categorized in the FPI regime?',
          answer: 'They will be categorized based on the new FPI norms.',
        },
        {
          question: 'Q6. Can an entity obtain more than one FPI registration?',
          answer: 'Yes, an entity can obtain more than one FPI registration.',
        },
        {
          question:
            'Q7. Whether the requirement of registering a broad-based fund by non-fund FIIs continue in FPI regime?',
          answer: 'Yes, the requirement continues in the FPI regime.',
        },
        {
          question:
            'Q8. FII and its SA are considered as Person Acting in Concert (PAC) for SEBI regulations. What is the requirement for FPIs?',
          answer:
            'FPIs will follow similar requirements as PAC for SEBI regulations.',
        },
        {
          question:
            'Q9. Whether the existing FII/Sub-Account has to submit Form A as per FPI Regulations at the time of conversion as FPI?',
          answer: 'Yes, Form A must be submitted during conversion.',
        },
        {
          question:
            'Q10. Whether existing FIIs/SAs be required to open new custody account, depository account, and bank account upon conversion to FPI?',
          answer: 'Existing accounts can be retained upon conversion.',
        },
        {
          question:
            'Q11. Whether the FIIs and SAs who hold 10% be required to disinvest the excess holdings?',
          answer: 'Yes, excess holdings beyond 10% must be disinvested.',
        },
        {
          question:
            'Q12. Can existing investments made as FIIs/SAs/Qualified Foreign Investors (QFIs) be retained under the FPI regime?',
          answer:
            'Yes, existing investments can be retained under the FPI regime.',
        },
      ],
    },
    'qfi-to-fpi': {
      title: 'Transition from QFI to FPI Regime',
      items: [
        {
          question: 'Q1. Why do QFIs need to transition to FPIs?',
          answer:
            'The transition aligns QFIs with the streamlined FPI framework introduced by SEBI, offering a unified regulatory structure for foreign investments in India.',
        },
        {
          question:
            'Q2. What steps must an individual QFI take to become an FPI?',
          answer:
            'Select a Designated Depository Participant (DDP), complete the FPI registration application, submit the required documents, and obtain the FPI certificate.',
        },
        {
          question:
            'Q3. What documents are required for individual investors transitioning from QFI to FPI?',
          answer:
            'Documents include identity proof, address proof, tax residency certificate, and declarations on beneficial ownership.',
        },
        {
          question:
            'Q4. Will my investments as a QFI be affected during the transition?',
          answer:
            'No, your existing investments remain valid. Update your account details post-FPI registration to reflect your new status.',
        },
        {
          question: 'Q5. Are there specific fees for transitioning to FPI?',
          answer:
            'Yes, registration fees vary by FPI category and must be paid to the DDP during the application process.',
        },
        {
          question:
            'Q6. What is the timeline for completing the QFI to FPI transition?',
          answer:
            'The timeline is as prescribed by SEBI, and QFIs must ensure they register as FPIs before the deadline to continue investing.',
        },
        {
          question:
            'Q7. Are there any eligibility criteria for QFIs to register as FPIs?',
          answer:
            'Yes, QFIs must meet SEBIs eligibility criteria, including compliance with KYC norms and beneficial ownership disclosure',
        },
        {
          question:
            'Q8. Can I continue investing as a QFI after the FPI transition period ends?',
          answer:
            'No, all QFIs must transition to FPIs to continue investing in Indian markets under the revised regulations.',
        },
        {
          question: 'Q9. Where can I seek help during the transition process?',
          answer:
            'You can contact your DDP, financial advisor, or refer to SEBI’s official guidelines for support and clarification.',
        },
        {
          question:
            'Q10. What are the benefits of transitioning from QFI to FPI?',
          answer:
            'The FPI framework offers simplified procedures, broader investment opportunities, and enhanced compliance with Indian regulatory standards.',
        },
      ],
    },
    eligibility: {
      title: 'Eligibility of FPIs',
      items: [
        {
          question: 'Q1. Who can register as an FPI?',
          answer:
            'Individuals, funds, and entities that meet SEBIs eligibility criteria, including compliance with KYC norms and beneficial ownership disclosure, can register as FPIs.',
        },
        {
          question:
            'Q2. Are there specific requirements for individual investors to qualify as FPIs?',
          answer:
            'Yes, individuals must provide valid identification, address proof, and details of tax residency, and comply with anti-money laundering and counter-terrorism financing norms.',
        },
        {
          question:
            'Q3. Can an individual investor register directly as an FPI?',
          answer:
            'Individual investors must register through a Designated Depository Participant (DDP) authorized by SEBI for FPI onboarding.',
        },
        {
          question:
            'Q4. Are there restrictions on the countries of origin for FPIs?',
          answer:
            'Yes, SEBI restricts FPI registration from countries that are non-compliant with FATF (Financial Action Task Force) standards or are under sanctions.',
        },
        {
          question:
            'Q5. What are the financial thresholds for individual investors to become FPIs?',
          answer:
            'While SEBI does not impose minimum financial thresholds for individuals, certain DDPs may have specific requirements based on risk assessment.',
        },
        {
          question:
            'Q6. Do individual investors need prior experience to qualify as FPIs?',
          answer:
            'No prior investment experience is mandated; however, compliance with SEBI regulations and the provision of accurate documentation is essential.',
        },
      ],
    },
    'ddp-responsibilities': {
      title: 'Responsibilities of Designated Depository Participant (DDP)',
      items: [
        {
          question:
            'Q1. What is the role of a Designated Depository Participant (DDP)?',
          answer:
            'A DDP is responsible for processing FPI registration applications, conducting due diligence, and ensuring compliance with SEBI regulations.',
        },
        {
          question:
            'Q2. How do DDPs assist individual investors during FPI registration?',
          answer:
            'DDPs guide investors through the registration process, verify documents, and ensure adherence to Know Your Customer (KYC) and Anti-Money Laundering (AML) norms.',
        },
        {
          question: 'Q3. Are DDPs responsible for monitoring FPI investments?',
          answer:
            'Yes, DDPs monitor FPI investments to ensure compliance with regulatory limits, including sectoral caps and clubbing provisions.',
        },
        {
          question: 'Do DDPs provide ongoing compliance support to FPIs?',
          answer:
            'Yes, DDPs assist FPIs with periodic reporting requirements, regulatory updates, and resolving compliance-related issues.',
        },
        {
          question:
            'Q5. Can an individual investor choose any DDP for FPI registration?',
          answer:
            'Individual investors must select a SEBI-authorized DDP listed on SEBI’s official website for their registration process.',
        },
      ],
    },
    'registration-certificate': {
      title: 'Generation of FPI registration certificate',
      items: [
        {
          question: 'Q1. How is an FPI registration certificate generated?',
          answer:
            'The Designated Depository Participant (DDP) reviews the application, verifies the documents, and upon approval, issues the FPI registration certificate to the applicant.',
        },
        {
          question:
            'Q2. What is the validity period of an FPI registration certificate?',
          answer:
            'The FPI registration certificate is typically valid for a block of three years, after which it must be renewed.',
        },
        {
          question:
            'Q3. Can individual investors apply directly for the registration certificate?',
          answer:
            'No, individual investors must apply through a SEBI-authorized DDP, which facilitates the issuance of the certificate.',
        },
        {
          question:
            'Q4. Is the registration certificate required for all types of investments?',
          answer:
            'Yes, the FPI registration certificate is mandatory for all foreign portfolio investments in Indian securities markets.',
        },
        {
          question:
            'Q5. How can an investor track the status of their FPI registration application?',
          answer:
            'Investors can track the application status through the DDP they have engaged, which communicates updates throughout the process.',
        },
      ],
    },
    'payment-fees': {
      title: 'Payment of Fees by FPI',
      items: [
        {
          question: 'Q1. What fees must an FPI pay during registration?',
          answer:
            'FPIs must pay registration fees to the Designated Depository Participant (DDP) as part of the registration process, with amounts varying by FPI category',
        },
        {
          question: 'Q2. Are there any annual fees for FPIs?',
          answer:
            'Yes, FPIs are required to pay annual fees to maintain their registration, as stipulated by SEBI, depending on their category and the assets under management.',
        },
        {
          question: 'Q3.Can the fee structure change over time?',
          answer:
            'Yes, SEBI periodically reviews and updates the fee structure, which FPIs must comply with to ensure continued registration.',
        },
        {
          question: 'Q4. How are the fees paid by FPIs?',
          answer:
            'The fees are typically paid directly to the DDP through bank transfers or other accepted payment methods.',
        },
        {
          question:
            'Q5. What happens if an FPI fails to pay the required fees?',
          answer:
            'Failure to pay the necessary fees may result in suspension or cancellation of the FPIs registration, affecting its ability to invest in Indian markets.',
        },
      ],
    },
    'investment-limits': {
      title: 'Clubbing of Investment Limits',
      items: [
        {
          question:
            'Q1. What is meant by the clubbing of investment limits for FPIs?',
          answer:
            'Clubbing of investment limits refers to aggregating the investment holdings of FPIs that have common ownership or control to ensure compliance with prescribed limits under SEBI regulations.',
        },
        {
          question:
            'Q2. Are individual FPIs subject to clubbing of investment limits?',
          answer:
            'Yes, if an individual FPI shares common ownership or control with another FPI, their investment limits may be clubbed as per SEBI guidelines.',
        },
        {
          question:
            'Q3. What is the investment limit applicable after clubbing?',
          answer:
            'The combined holdings of clubbed FPIs must not exceed 10% of the total paid-up equity capital of a company.',
        },
        {
          question:
            'Q4.How is ownership or control determined for clubbing purposes?',
          answer:
            'Ownership or control is assessed based on factors such as voting rights, direct or indirect shareholding, and other forms of control as defined by SEBI..',
        },
        {
          question:
            'Q5. Can clubbing be avoided if FPIs declare themselves independent?',
          answer:
            'No, clubbing applies if SEBI determines that ownership or control criteria are met, irrespective of individual declarations.',
        },
      ],
    },
    'debt-securities': {
      title: 'FPI Investments in Debt Securities',
      items: [
        {
          question:
            'Q1. Are FPIs allowed to invest in debt securities in India?',
          answer:
            'Yes, FPIs can invest in various debt instruments, including government securities, corporate bonds, and municipal bonds, subject to SEBI and RBI regulations.',
        },
        {
          question:
            'Q2. What are the investment limits for FPIs in debt securities?',
          answer:
            'Investment limits are set by RBI and vary across categories, such as government securities and corporate bonds, with separate caps for specific instruments.',
        },
        {
          question: 'Q3. Can individual FPIs invest in municipal bonds?',
          answer:
            'Yes, FPIs are permitted to invest in municipal bonds as part of their investment in debt securities.',
        },
        {
          question:
            'Q4. Are there restrictions on short-term debt investments by FPIs?',
          answer:
            'Yes, FPIs must adhere to SEBIs limits on short-term investments, typically not exceeding 30% of their total debt portfolio in short-term securities.',
        },
        {
          question:
            'Q5. What compliance requirements apply to FPI investments in debt securities?',
          answer:
            'FPIs must ensure adherence to end-use restrictions, investment limits, and reporting obligations as mandated by SEBI and RBI.',
        },
      ],
    },
    odis: {
      title: 'Offshore Derivative Instruments (ODIs)',
      items: [
        {
          question: 'Q1. What are Offshore Derivative Instruments (ODIs)?',
          answer:
            'ODIs are financial instruments issued by FPIs to foreign investors, allowing them to gain exposure to Indian securities without directly investing in them.',
        },
        {
          question: 'Q2. Can individual investors purchase ODIs?',
          answer:
            'No, ODIs are typically issued to institutional investors who comply with SEBIs eligibility and KYC norms, not to individual investors.',
        },
        {
          question: 'Q3. Are ODIs subject to SEBI regulations?',
          answer:
            'Yes, ODIs must comply with SEBI regulations, including restrictions on issuance, reporting obligations, and adherence to the FPI framework.',
        },
        {
          question: 'Q4. What types of securities can ODIs be linked to?',
          answer:
            'ODIs can be linked to equity, debt, derivatives, or other Indian securities as permitted by SEBI.',
        },
        {
          question: 'Q5. What are the transparency requirements for ODIs?',
          answer:
            'FPIs issuing ODIs must maintain records of beneficial owners and provide periodic reports to SEBI to ensure compliance.',
        },
      ],
    },
    'additional-queries': {
      title: 'Replies to Additional Queries received from DDPs',
      items: [
        {
          question:
            'Q1.Why might a DDP request additional information from an FPI?',
          answer:
            'A DDP may request further details or clarification to ensure compliance with SEBI regulations, verify the accuracy of submitted documents, or address any discrepancies.',
        },
        {
          question:
            'Q2. How should an individual FPI respond to additional queries from a DDP?',
          answer:
            'The individual FPI should promptly provide the requested information or documents to the DDP in the specified format to avoid delays in the registration process.',
        },
        {
          question:
            'Q3.Is there a deadline for responding to additional queries from a DDP?',
          answer:
            'Yes, FPIs are typically given a specific timeframe to respond to DDP queries. Failure to do so may lead to delays or rejection of the application.',
        },
        {
          question:
            'Q4. What happens if an FPI fails to provide the requested information?',
          answer:
            'Failure to provide the necessary information may result in the DDP rejecting the FPI registration application or the suspension of the registration process.',
        },
        {
          question:
            'Q5.Can an FPI appeal if their response is not accepted by the DDP?',
          answer:
            'Yes, FPIs can appeal to SEBI or request further clarification from the DDP if they believe the response was not adequately addressed.',
        },
      ],
    },
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.topicSlug = params.get('slug') || '';

      if (this.faqTopicData[this.topicSlug]) {
        this.topicTitle = this.faqTopicData[this.topicSlug].title;
        this.faqDetailItems = this.faqTopicData[this.topicSlug].items;
      } else {
        console.error(`Topic with slug '${this.topicSlug}' not found`);
        this.router.navigate(['/faq']);
      }
    });
  }
}
