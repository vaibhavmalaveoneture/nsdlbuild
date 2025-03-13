import { NgModule, provideZoneChangeDetection } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Prime NG
import Aura from '@primeng/themes/aura';

import { AccordionModule } from 'primeng/accordion';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePipe } from '@angular/common';
import { providePrimeNG } from 'primeng/config';
import { BASE_PATH } from '../swagger';
import { environment } from '../environments/environment';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DatePickerModule } from 'primeng/datepicker';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DrawerModule } from 'primeng/drawer';
import { PanelMenuModule } from 'primeng/panelmenu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { FileUploadModule } from 'primeng/fileupload';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgCircleProgressModule } from 'ng-circle-progress';
//import { NewPasswordNewComponent } from './authentication/new-password-new/new-password-new.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AccordionModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    ConfirmDialogModule,
    DrawerModule,
    MenubarModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    DatePickerModule,
    CardModule,
    TableModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    BreadcrumbModule,
    InputTextModule,
    SelectModule,
    PanelMenuModule,
    OverlayPanelModule,
    RadioButtonModule,
    ScrollPanelModule,
    FileUploadModule,
    SplitButtonModule,
    MultiSelectModule,
    BrowserAnimationsModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 20,
      outerStrokeWidth: 4,
      innerStrokeWidth: 2,
      animationDuration: 9000,
      showSubtitle: true,
      showUnits: true,
      showBackground: true,
    }),
  ],
  providers: [
    MessageService,
    ConfirmationService,
    { provide: BASE_PATH, useValue: environment.BASE_PATH },
    DatePipe,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi()),
    provideClientHydration(),
    // provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false || 'none',
        },
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
