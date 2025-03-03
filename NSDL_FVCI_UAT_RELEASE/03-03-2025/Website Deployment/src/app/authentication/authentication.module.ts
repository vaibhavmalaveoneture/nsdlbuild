import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { RegisterComponent } from './register/register.component';

// Prime NG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { StepperModule } from 'primeng/stepper';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RouterLink } from '@angular/router';
import { InputOtpModule } from 'primeng/inputotp';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PopoverModule } from 'primeng/popover';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { HeaderComponent } from '../standalone/shared/header/header.component';
import { FooterComponent } from '../standalone/shared/footer/footer.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoaderComponent } from '../standalone/loader/loader.component';

@NgModule({
  declarations: [RegisterComponent, LoginComponent, ForgotPasswordComponent],
  imports: [
    CommonModule,
    LoaderComponent,
    FormsModule,
    ReactiveFormsModule,
    AuthenticationRoutingModule,
    HeaderComponent,
    FooterComponent,
    CardModule,
    ConfirmDialogModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    DividerModule,
    FloatLabelModule,
    StepperModule,
    RadioButtonModule,
    InputOtpModule,
    TooltipModule,
    CommonModule,
    SelectModule,
    DatePickerModule,
    OverlayPanelModule,
    PopoverModule,
    ToastModule,
  ],
  providers: [RouterLink],
})
export class AuthenticationModule {}
