import { Component } from '@angular/core';

@Component({
  selector: 'app-single-window-services',
  standalone: false,
  templateUrl: './single-window-services.component.html',
  styleUrl: './single-window-services.component.scss',
})
export class SingleWindowServicesComponent {
  sws_main: string = '/assets/sws-new.png';
  sws1: string = '/assets/sws1.png';
  sws2: string = '/assets/sws2.png';
  sws3: string = '/assets/sws3.png';
  sws4: string = '/assets/sws4.png';
}
