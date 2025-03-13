import { Component } from '@angular/core';

@Component({
  selector: 'app-value-added-services',
  standalone: false,
  templateUrl: './value-added-services.component.html',
  styleUrl: './value-added-services.component.scss',
})
export class ValueAddedServicesComponent {
  vas1: string = '/assets/vas1.png';
  vas2: string = '/assets/vas2.png';
  vas3: string = '/assets/vas3.png';
  vas4: string = '/assets/vas4.png';
}
