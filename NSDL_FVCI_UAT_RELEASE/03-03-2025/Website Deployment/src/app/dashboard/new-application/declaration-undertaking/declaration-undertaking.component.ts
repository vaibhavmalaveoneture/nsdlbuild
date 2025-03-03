import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-declaration-undertaking',
  standalone: false,
  templateUrl: './declaration-undertaking.component.html',
  styleUrl: './declaration-undertaking.component.scss',
})
export class DeclarationUndertakingComponent {
  @Input() applicationId: string | undefined;
  download: string = '/assets/downloads.png';

  readonly tableData = [
    {
      name: 'Roopali Katre DSC testing',
      designation: 'AM',
      status: 'Digitally Signed',
    },
  ];

  readonly signatureOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ];
}
