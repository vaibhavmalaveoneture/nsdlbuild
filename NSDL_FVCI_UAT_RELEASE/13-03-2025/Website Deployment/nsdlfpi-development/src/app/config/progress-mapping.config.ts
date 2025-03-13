export const progressMappingConfig = {
  overall: {
    kycDetails: {
      fields: [
        'name',
        'legalFormAndLawOfIncorporation',
        'legalEntityIdentifier',
      ],
    },
    registrationDetails: {
      fields: [
        'typeOfApplicant',
        'isProvidedFactaCrsProvided',
        'isComingFromGlobalCustodian',
        'custodianName',
        'custodianRegistrationNumber',
        'bankName',
        'bankAddress',
      ],
      conditional: {
        condition: (val: any) =>
          val !== undefined &&
          val !== null &&
          typeof val === 'string' &&
          val.trim().length > 0,
        field: 'otherTypeOfApplicant',
      },
    },
  },
  components: {
    // Component 1 mapping
    component1: {
      name: [''],
      applicantOtherName: {
        fields: ['otherNameRadio'],
        conditional: {
          condition: (val: any) => val === true,
          field: 'otherNameField',
        },
      },
      legalForm: [''],
      lei: [''],
      communicationAddress: [''],
      taxResidencyRows: ['trcNo', 'country'],
      registeredOffice: [
        'registeredFlatNum',
        'registeredBuildingName',
        'registeredCountryName',
        'registeredRoadName',
        'registeredAreaName',
        'registeredTownName',
        'registeredZipName',
        'registeredStateName',
      ],
      OfficeInIndia: [
        'OfficeInIndiaRadio',
        'indianFlatNum',
        'indianBuildingName',
        'indianCountryName',
        'indianRoadName',
        'indianAreaName',
        'indianTownName',
        'indianZipName',
        'indianStateName',
      ],
      foreignOffice: [
        'foreignFlatNum',
        'foreignBuildingName',
        'foreignCountryName',
        'foreignRoadName',
        'foreignAreaName',
        'foreignTownName',
        'foreignZipName',
        'foreignStateName',
      ],
      incomeDetails: [
        'incomeSource',
        'businessCode',
        'annualIncome',
        'assetLess',
      ],
    },
    // Component 2 mapping
    component2: {
      applicantType: {
        fields: ['applicantTypeName', 'applicantTypeRadio'],
        conditional: {
          condition: (value: any) => value === 'applicantTypeRadioYes',
          field: 'applicantTypeOtherEntity',
        },
      },
      providedValidForm: [''],
      throughGlobalCustodian: [
        'throughGlobalCustodianRadio',
        'throughGlobalCustodianName',
        'throughGlobalCustodianAddress',
      ],
      designatedBank: ['designatedBankName', 'designatedBankAddress'],
      priorAssociation: ['priorAssociationRadio', 'detailsOfPriorAssociation'],
      hasPan: ['hasPanRadio', 'hasPanNumber'],
      disciplinaryHistory: [
        'disciplinaryHistoryRadio',
        'disciplinaryHistoryText',
      ],
    },
    // Component 3 mapping
    component3: {
      seggregatedPortfolio: [
        'seggregatedPortfolioRadio',
        'seggregatedPortfolioText',
      ],
      bankDeclaration: ['bankDeclarationRadio', 'bankDeclarationText'],
      consentIntermediary: [
        'consentIntermediaryRadio',
        'consentIntermediaryName',
        'consentIntermediaryEmail1',
        'consentIntermediaryEmail2',
        'consentIntermediaryEmail3',
        'consentIntermediaryMobile',
      ],
    },
    // Extend with mappings for additional components as needed...
  },
};
