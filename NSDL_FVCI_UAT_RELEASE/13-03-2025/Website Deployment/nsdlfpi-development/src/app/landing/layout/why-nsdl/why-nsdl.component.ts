import { Component } from '@angular/core';

@Component({
  selector: 'app-why-nsdl',
  standalone: false,
  templateUrl: './why-nsdl.component.html',
  styleUrl: './why-nsdl.component.scss',
})
export class WhyNsdlComponent {
  sws: string = '/assets/sws.png';
  reports: string = '/assets/reports.png';
  monitoring: string = '/assets/monitoring.png';
}
