import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-acknowledgement',
  standalone: false,
  templateUrl: './acknowledgement.component.html',
  styleUrl: './acknowledgement.component.scss',
})
export class AcknowledgementComponent {
  @Input() applicationId: string | undefined;
  download: string = '/assets/downloads.png';
}
