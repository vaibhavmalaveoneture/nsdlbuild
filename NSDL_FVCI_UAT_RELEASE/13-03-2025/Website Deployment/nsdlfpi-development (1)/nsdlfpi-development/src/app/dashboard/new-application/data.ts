export const data = [
  {
    id: 'a)',
    name: 'Date of Birth/ Incorporation/ Agreement/ Partnership or Trust Deed/ Establishment/ Formation of body of Individuals or Associations of persons ',
  },
  {
    id: 'b)',
    name: 'Date of Commencement of Business (Not applicable for Individuals)',
  },
];

export const taxData = [
  {
    id: 'b)',
    trcNo: '',
    country: '',
  },
];

export const tableData = [
  {
    id: 'a)',
    name: 'Place',
    placeHolder: 'Enter Place',
    type: 'text',
  },
  {
    id: 'b)',
    name: 'Country',
    placeHolder: 'Enter Country',
    type: 'dropdown',
    dropdownType: 'country',
  },
  {
    id: 'c)',
    name: 'ISD Country Code',
    placeHolder: 'Enter ISD Code',
    type: 'dropdown',
    dropdownType: 'countryCode',
  },
];

export const contactData = [
  {
    id: 'a)',
  },
];

export const detailsData = [
  {
    id: '1',
    text: 'Name & Address of the Beneficial Owner *',
    placeHolder: 'Enter Name & Address',
    type: 'text',
  },
  {
    id: '2',
    text: 'Date of Birth *',
    placeHolder: 'Select Date of Birth *',
    type: 'date',
  },
  {
    id: '3',
    text: 'Tax Residency Jurisdiction *',
    placeHolder: 'Enter Tax Residency Jurisdiction',
    type: 'text',
    options: ['India', 'USA', 'UK', 'Australia'],
  },
  {
    id: '4',
    text: 'Nationality *',
    placeHolder: 'Enter Nationality',
    type: 'text',
    options: ['Indian', 'American', 'British', 'Australian'],
  },
  {
    id: '5',
    text: 'Whether acting alone or together, or through one or more natural person as group with their name & address',
    placeHolder: 'Enter Details',
    type: 'text',
  },
  {
    id: '6',
    text: 'BO Group Percentage Shareholding / Capital / profit ownership in the FPIs',
    placeHolder: 'Enter Details',
    type: 'text',
  },
  {
    id: '7',
    text: 'Tax Residency Number/Social Security Number/Passport Number of BO/any other Government issued identity document number (example Driving Licence) [Please provide any]',
    placeHolder: 'Enter Details',
    type: 'text',
  },
];

export const docData = [
  {
    id: 'a)',
    name: 'Proof of Identity (POI)',
    placeHolder: 'Proof of Identity',
    type: 'POI',
  },
  {
    id: 'b)',
    name: 'Proof of Address (POA)',
    placeHolder: 'Proof of Address',
    type: 'POA',
  },
];

export const designationData = [
  {
    id: 'a)',
    name: 'Details of Designated Depository Participant',
  },
  {
    id: 'b)',
    name: 'Details of Custodian',
  },
  {
    id: 'c)',
    name: 'Details of Depository Participant',
  },
];

export const regulationData = [
  {
    id: 'a)',
    name: 'Name',
    placeholder: 'Enter Name',
    type: 'text',
  },
  {
    id: 'b)',
    name: 'Country',
    placeholder: 'Select Country',
    type: 'dropdown',
  },
  {
    id: 'c)',
    name: 'Website',
    placeholder: 'Enter Name',
    type: 'text',
  },
  {
    id: 'd)',
    name: 'Registration Number/Code with regulator, if any',
    placeholder: 'Enter Number/Code',
    type: 'text',
  },
  {
    id: 'e)',
    name: 'Category / Capacity in which the applicant is Regulated',
    placeholder: 'Enter Category/Capacity',
    type: 'text',
  },
];

export const signatoryData = [
  {
    id: '1',
    text: 'Name',
    type: 'text',
    placeholder: 'Enter Full Name',
  },
  {
    id: '2',
    text: 'Relationship with Applicant (e.g., promoters, directors, signatory, etc.)',
    type: 'text',
    placeholder: 'Enter Relationship With Applicant',
  },
  {
    id: '3',
    text: 'PAN (if applicable)',
    type: 'text',
    placeholder: 'Enter PAN',
  },
  {
    id: '4',
    text: 'Nationality / Country of Residence',
    type: 'dropdown',
    placeholder: 'Select Nationality',
  },
  {
    id: '5',
    text: 'Date of Birth (DD/MM/YYYY)',
    type: 'date',
    placeholder: 'Select Date Of Birth',
  },
  {
    id: '6',
    text: 'Residential/Registered Address',
    type: 'text',
    placeholder: 'Enter Address',
  },
  {
    id: '7',
    text: 'Government Issued Identity Document Number (e.g., Driving License)',
    type: 'text',
    placeholder: 'Enter Document Number',
  },
];

export interface City {
  name: string;
  code: string;
}

export interface TaxRow {
  id: string;
  trcNo: string;
  country: string;
}

export interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

export interface Country {
  name: string;
  code: string;
}

export interface FPI {
  id: number;
  registrationNo: string;
  name: string;
  category: 'Category 1' | 'Category 2' | 'Category 3';
  validUpto: string;
  country: Country;
  status: 'registered' | 'invalid' | 'expired';
}

export interface Income {
  name: string;
  code: string;
}

export const fpiData: FPI[] = [
  {
    id: 1,
    registrationNo: 'IN0001234567',
    name: 'BlackRock Investment Management',
    category: 'Category 1',
    validUpto: '2025-12-31',
    country: {
      name: 'United States',
      code: 'us',
    },
    status: 'registered',
  },
  {
    id: 2,
    registrationNo: 'IN0002345678',
    name: 'Fidelity International',
    category: 'Category 2',
    validUpto: '2024-06-30',
    country: {
      name: 'United Kingdom',
      code: 'gb',
    },
    status: 'registered',
  },
  {
    id: 3,
    registrationNo: 'IN0003456789',
    name: 'Nomura Asset Management',
    category: 'Category 3',
    validUpto: '2023-12-31',
    country: {
      name: 'Japan',
      code: 'jp',
    },
    status: 'expired',
  },
  {
    id: 4,
    registrationNo: 'IN0004567890',
    name: 'UBS Asset Management',
    category: 'Category 1',
    validUpto: '2024-03-15',
    country: {
      name: 'Switzerland',
      code: 'ch',
    },
    status: 'invalid',
  },
  {
    id: 5,
    registrationNo: 'IN0005678901',
    name: 'Deutsche Bank Investment',
    category: 'Category 2',
    validUpto: '2025-09-30',
    country: {
      name: 'Germany',
      code: 'de',
    },
    status: 'registered',
  },
  {
    id: 6,
    registrationNo: 'IN0005678902',
    name: 'HSBC Global Finance',
    category: 'Category 1',
    validUpto: '2026-03-15',
    country: {
      name: 'United Kingdom',
      code: 'gb',
    },
    status: 'registered',
  },
  {
    id: 7,
    registrationNo: 'IN0005678903',
    name: 'Citibank Capital Markets',
    category: 'Category 3',
    validUpto: '2027-07-20',
    country: {
      name: 'United States',
      code: 'us',
    },
    status: 'invalid',
  },
  {
    id: 8,
    registrationNo: 'IN0005678904',
    name: 'Mizuho Securities',
    category: 'Category 2',
    validUpto: '2025-12-10',
    country: {
      name: 'Japan',
      code: 'jp',
    },
    status: 'registered',
  },
  {
    id: 9,
    registrationNo: 'IN0005678905',
    name: 'BNP Paribas Asset Management',
    category: 'Category 1',
    validUpto: '2026-06-30',
    country: {
      name: 'France',
      code: 'fr',
    },
    status: 'expired',
  },
  {
    id: 10,
    registrationNo: 'IN0005678906',
    name: 'Standard Chartered Investments',
    category: 'Category 3',
    validUpto: '2028-02-05',
    country: {
      name: 'Singapore',
      code: 'sg',
    },
    status: 'registered',
  },
];
