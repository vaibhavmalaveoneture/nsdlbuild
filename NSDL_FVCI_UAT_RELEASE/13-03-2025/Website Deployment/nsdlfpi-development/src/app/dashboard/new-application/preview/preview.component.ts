import { Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  City,
  contactData,
  data,
  detailsData,
  docData,
  tableData,
  taxData,
} from '../data';

@Component({
  selector: 'app-preview',
  standalone: false,
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss',
})
export class PreviewComponent {
  @Input() applicationId: string | undefined;
  download: string = '/assets/downloads.png';
  cities: City[] | undefined;

  formGroup: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    otherName: new FormControl('', [Validators.required]),
    date: new FormControl<Date | null>(null, [Validators.required]),
    text: new FormControl<string | null>(null),
    selectedCity: new FormControl<City | null>(null),
    taxRows: new FormArray([]),
    doYouHaveOfficeInIndia: new FormControl(null, [Validators.required]),
    indianOfficeAddress: new FormGroup({
      flatNo: new FormControl(''),
      buildingName: new FormControl(''),
      countryName: new FormControl(''),
      roadName: new FormControl(''),
      areaName: new FormControl(''),
      cityName: new FormControl(''),
      zipCode: new FormControl(''),
      state: new FormControl(''),
    }),
    ultimateBeneficialOwner: new FormControl(null, [Validators.required]),
    communicationAddress: new FormControl('', [Validators.required]),
    beneficialOwnership: new FormControl(null, [Validators.required]),
    politicallyExposed: new FormControl(null, [Validators.required]),
    relatedToPoliticallyExposed: new FormControl(null, [Validators.required]),
    knownByOtherName: new FormControl('', [Validators.required]),
    otherName1: new FormControl('', [Validators.required]),
  });

  data = data;
  taxData = taxData;
  tableData = tableData;
  contactData = contactData;
  detailsData = detailsData;
  docData = docData;

  get taxRows() {
    return this.formGroup.get('taxRows') as FormArray;
  }

  ngOnInit(): void {
    this.initializeTaxRow();

    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' },
    ];

    this.detailsData.forEach((item) => {
      this.formGroup.addControl(
        item.id,
        new FormControl('', Validators.required)
      );
    });
  }

  initializeTaxRow() {
    const row = new FormGroup({
      id: new FormControl(this.getNextIdentifier()),
      trcNo: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
    });
    this.taxRows.push(row);
  }

  getNextIdentifier(): string {
    if (this.taxRows.length === 0) return 'b)';
    const lastId = this.taxRows.at(this.taxRows.length - 1).get('id')?.value;
    const nextChar = String.fromCharCode(lastId.charCodeAt(0) + 1);
    return `${nextChar})`;
  }

  addNewRow() {
    this.initializeTaxRow();
  }

  removeRow(index: number) {
    this.taxRows.removeAt(index);
  }
}
