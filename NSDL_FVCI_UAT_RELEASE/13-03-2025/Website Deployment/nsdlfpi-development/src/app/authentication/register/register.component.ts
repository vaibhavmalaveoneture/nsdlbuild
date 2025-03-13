import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import {
  CommonService,
  UpdateDdpDto,
  UserAsType,
  UserRegistrationDto,
} from '../../../swagger';
import { UserSyncService } from '../../services/user-sync.service';
import { Router } from '@angular/router';
import { NgForm, NgModel } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  @ViewChild('loginForm') loginForm!: NgForm;
  @ViewChildren(NgModel) formControls!: QueryList<NgModel>;

  // Add this method to your RegisterComponent class
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showLoader: boolean = false;
  userType!: string;
  fpiType!: string;
  tick: string = 'assets/fi_check-circle.png';
  value: any;
  countries: any[] = [];
  otpLength: number = 6;
  selectedCountry: any = null;
  showIncorrectOTP = false;
  showAccountBlocked = false;
  showOTPExpired = false;
  showOTPSent = true;
  countdownMinutes: number = 1;
  countdownSeconds: number = 0;
  interval: any;
  isDisabled = true;
  issuedIdentity: any[] = [
    { name: 'Tax Residency Certificate Number' },
    { name: 'Driving License Number' },
    { name: 'Other(please specify)' },
  ];
  selectedIssuedIdentity: any = null;
  countryCodes: any[] = [];
  selectedCountryCode: any = { code: '+1' };
  password: string = '';
  confirmPassword: string = '';
  @ViewChild('tooltipContent', { static: true })
  tooltipContent!: TemplateRef<any>;
  passwordValidation = {
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  };
  residencyRegistrationNumber: any[] = [
    { name: 'Tax Residency Certificate Number' },
    { name: 'LEI Number' },
    { name: 'Registration Number' },
    { name: 'Other(please specify)' },
  ];
  selectedResidencyRegistrationNumber: any = null;
  currentStep: number = 1;
  userRegistration: UserRegistrationDto = {
    user_as: UserAsType.FPIINDIVIDUAL,
    user_name_fpi_app: '',
    entity_name: '',
    specify_reg: '',
    specify_other: '',
    lei_reg_no: '',
    lei_details: '',
    gc_name: '',
    gc_reg_no: '',
    gc_name_of_user: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    country_code: '',
    address_1: '',
    address_2: '',
    address_3: '',
    number: '',
    area_code: '',
    email_id: '',
    password: '',
  };
  maxDob: Date = new Date(
    new Date().setFullYear(new Date().getFullYear() - 18)
  );
  otp: string = '';
  ddps: any[] = [];
  selectedDdp: any = null;
  captcha: string = '';
  captchaText: string = '';
  captchaInput: string = '';
  rotationDegree = 0;

  constructor(
    private readonly userSyncService: UserSyncService,
    private readonly commonService: CommonService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadData();
    const token = sessionStorage.getItem('jwtToken');
    const email = sessionStorage.getItem('userEmailRegistration');
    if (token) {
      this.fetchDDPs();
    } else if (email) {
      this.handleEmailVerification(email);
    } else {
      this.generateCaptcha();
    } 
  }

  private async handleEmailVerification(email: string): Promise<void> {
    this.showLoader = true;
    try {
      this.userRegistration.email_id = email;
      await this.triggerOtp();
      this.currentStep = 3;
    } catch (err) {
      console.error('Error triggering OTP:', err);
    } finally {
      this.showLoader = false;
    }
  }

  validatePassword(password: string) {
    if (!password) {
      // If password is null, undefined, or empty string, set all validations to false
      this.passwordValidation = {
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
      };
      return;
    }

    // Original validation logic for when password exists
    this.passwordValidation = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*]/.test(password),
    };
  }

  isPasswordValid(): boolean {
    return Object.values(this.passwordValidation).every(
      (value) => value === true
    );
  }

  passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  showPasswordValidation(password: string, op: any) {
    if (password && !this.isPasswordValid()) {
      op.show();
    } else {
      op.hide();
    }
  }

  togglePassword(event: MouseEvent) {
    const inputEl = (event.target as HTMLElement).parentElement?.querySelector(
      'input'
    );
    if (inputEl) {
      const type = inputEl.type === 'password' ? 'text' : 'password';
      inputEl.type = type;
      const iconEl = event.target as HTMLElement;
      if (type === 'text') {
        iconEl.classList.remove('pi-eye');
        iconEl.classList.add('pi-eye-slash');
      } else {
        iconEl.classList.remove('pi-eye-slash');
        iconEl.classList.add('pi-eye');
      }
    }
  }

  handleRadioKeydown(
    event: KeyboardEvent,
    value: string,
    type: 'userType' | 'fpiType'
  ): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (type == 'userType') {
        this.userType = value;
      } else if (type == 'fpiType') {
        this.fpiType = value;
      }
    }
  }

  async loadData() {
    this.showLoader = true;
    try {
      const res: any = await firstValueFrom(
        this.commonService.apiCommonCountriesGet()
      );
      console.log("success:", res.success)
      console.log("data:", res.data)
      if (res?.success && Array.isArray(res.data.country)) {
        this.countries = res.data.country.map((country: any) => ({
          name: country.country_name,
          code: country.country_code.toString(),
          id: country.country_id,
        }));
        console.log(" this.countries:",  this.countries)
        this.countryCodes = this.countries.map(({ code }) => ({ code }));
        this.selectedCountry =
          this.countries.find((c) => c.code === '+91') || null;
        this.selectedCountryCode =
          this.countryCodes.find((c) => c.code === '+91') || null;
      }
    } catch (error) {
      console.error('Error fetching country codes:', error);
    } finally {
      this.showLoader = false;
    }
  }

  onCountryChange(selected: any) {
    if (selected) {
      this.selectedCountryCode = this.countryCodes.find(
        (c) => c.code === selected.code
      ) || { code: '' };
    }
  }

  async registerUser(activateCallback: (step: number) => void) {
    if (this.userType === 'FPI Applicant') {
      this.userRegistration.user_as =
        this.fpiType === 'yes'
          ? UserAsType.FPIINDIVIDUAL
          : UserAsType.FPINONINDIVIDUAL;
    } else if (this.userType === 'Global Custodian') {
      this.userRegistration.user_as = UserAsType.GLOBALCUSTODIAN;
    }
    this.userRegistration.country = this.selectedCountry
      ? this.selectedCountry.name
      : '';
    this.userRegistration.country_code = this.selectedCountryCode
      ? this.selectedCountryCode.code
      : '';
    this.userRegistration.password = this.password;
    this.showLoader = true;
    try {
      const res: any = await this.userSyncService.register(
        this.userRegistration
      );
      if (
        res &&
        (res.success ||
          res.message === 'Email or mobile number already registered')
      ) {
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: res.message,
          });
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Already Registered',
            detail: res.message,
          });
        }
        sessionStorage.setItem('userEmailRegistration', this.userRegistration.email_id);
        await this.triggerOtp(activateCallback);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: res.message || 'Registration failed.',
        });
      }
    } catch (error: any) {
      console.error('Error during signup:', error);
      if (error.status === 409) {
        await this.triggerOtp(activateCallback);
      } else {
        let errorMessage = 'An unknown error occurred.';
        if (error.status === 400) {
          errorMessage = 'Invalid input or email already registered.';
        } else if (error.status === 500) {
          errorMessage = 'Internal server error, please try again later.';
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
        });
      }
    } finally {
      this.showLoader = false;
    }
  }

  async triggerOtp(activateCallback?: (step: number) => void): Promise<void> {
    this.showLoader = true;
    try {
      const otpResponse: any = await this.userSyncService.sendOtp({
        email_id: this.userRegistration.email_id,
      });
      if (otpResponse?.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'OTP Sent',
          detail: otpResponse.message,
        });
        this.disableOTPBtnTemp(this.countdownMinutes * 60 * 1000);
        if (activateCallback) {
          activateCallback(3);
          this.scrollToTop();
        } else {
          this.currentStep = 3;
          this.scrollToTop();
        }
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'OTP Error',
          detail: otpResponse.message || 'Failed to send OTP.',
        });
      }
    } catch (otpError: any) {
      console.error('Error sending OTP:', otpError);
      this.messageService.add({
        severity: 'error',
        summary: 'OTP Error',
        detail: 'Failed to send OTP.',
      });
    } finally {
      this.showLoader = false;
    }
  }

  startCountdown() {
    this.interval = setInterval(() => {
      if (this.countdownSeconds > 0) {
        this.countdownSeconds--;
      } else if (this.countdownMinutes > 0) {
        this.countdownMinutes--;
        this.countdownSeconds = 59;
      } else {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  disableOTPBtnTemp(time: number) {
    this.isDisabled = true;
    this.startCountdown();
    setTimeout(() => {
      this.isDisabled = false;
    }, time);
  }

  onOtpChange(value: string, activateCallback: (step: number) => void): void {
    this.otp = value;
    if (value && value.length === 6) {
      this.verifyOtp(activateCallback);
    }
  }

  async verifyOtp(activateCallback: (step: number) => void): Promise<void> {
    this.showLoader = true;
    try {
      const payload = {
        email_id: this.userRegistration.email_id,
        otp: this.otp,
      };
      const res: any = await this.userSyncService.verifyOtp(payload);
      if (res?.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: res.message || 'OTP verified successfully.',
        });
        this.fetchDDPs(activateCallback);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: res.message || 'OTP verification failed.',
        });
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      let errorMessage = 'An unknown error occurred while verifying OTP.';
      if (error.status === 400) {
        errorMessage = 'Invalid OTP.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error while verifying OTP.';
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
      });
    } finally {
      this.showLoader = false;
    }
  }

  async fetchDDPs(activateCallback?: (step: number) => void): Promise<void> {
    this.showLoader = true;
    try {
      const ddpResponse: any = await firstValueFrom(
        this.commonService.apiCommonDdpsGet()
      );
      if (ddpResponse?.success) {
        this.ddps = ddpResponse.data.ddp;
        sessionStorage.removeItem('userEmailRegistration');
        if (activateCallback) {
          activateCallback(4);
          this.scrollToTop();
        } else {
          sessionStorage.removeItem('userEmailRegistration');
          this.currentStep = 1;
          this.refreshCaptcha();
          this.scrollToTop();
        }
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: ddpResponse.message || 'Failed to load DDPs.',
        });
        sessionStorage.removeItem('userEmailRegistration');
        this.currentStep = 1;
        this.refreshCaptcha();
          this.scrollToTop();
      }
    } catch (error: any) {
      console.error('Error fetching DDPs:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error fetching DDPs.',
      });
      sessionStorage.removeItem('userEmailRegistration');
      this.currentStep = 1;
          this.scrollToTop();
          this.refreshCaptcha();
    } finally {
      this.showLoader = false;
    }
  }

  async updateSelectedDDP(
    activateCallback: (step: number) => void
  ): Promise<void> {
    this.showLoader = true;
    try {
      if (!this.selectedDdp?.ddp_id) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please select a DDP.',
        });
        return;
      }
      const updateDdpDto: UpdateDdpDto = { ddpId: this.selectedDdp.ddp_id };
      const res: any = await this.userSyncService.updateDDP(updateDdpDto);
      if (res?.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'DDP updated successfully.',
        });
        activateCallback(5);
        this.scrollToTop();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: res.message || 'Failed to update DDP.',
        });
      }
    } catch (error: any) {
      console.error('Error updating DDP:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'An unknown error occurred while updating DDP.',
      });
    } finally {
      this.showLoader = false;
    }
  }

  isFormValid(): boolean {
    const controlsToValidate: string[] = [];
    if (!this.userType) {
      this.markControlGroupAsTouched('userType');
      return false;
    }
    if (this.userType === 'FPI Applicant' && !this.fpiType) {
      // this.markControlGroupAsTouched('userType');
      this.markControlGroupAsTouched('fpiType');
      return false;
    }
    const commonControls = [
      'city',
      'state',
      'pincode',
      'country',
      'countryCode',
      'mno',
      'area',
      'userid',
      'password',
      'confirmPassword',
      'captcha',
    ];
    controlsToValidate.push(...commonControls);
    if (this.userType === 'FPI Applicant') {
      controlsToValidate.push('userType');
      if (this.fpiType === 'yes') {
        controlsToValidate.push(
          'fpiType',
          'user-name',
          'authority-issued-identifier'
        );
        if (this.selectedIssuedIdentity?.name === 'Other(please specify)') {
          controlsToValidate.push('authority-issued-identifier-other');
        }
        controlsToValidate.push('number-identifier', 'date-of-birth');
      } else if (this.fpiType === 'no') {
        controlsToValidate.push(
          'fpiType',
          'organisation-name',
          'user-name',
          'residency-registration-number'
        );
        if (
          this.selectedResidencyRegistrationNumber?.name ===
          'Other(please specify)'
        ) {
          controlsToValidate.push('residency-registration-number-other');
        }
        controlsToValidate.push('number-identifier');
      }
    } else if (this.userType === 'Global Custodian') {
      controlsToValidate.push(
        'userType',
        'global-custodian-name',
        'global-custodian-registration-number',
        'global-custodian-name-of-user'
      );
    }
    if (this.formControls) {
      this.formControls.forEach((control) => {
        if (controlsToValidate.includes(control.name)) {
          control.control.markAsTouched();
          control.control.markAsDirty();
        }
      });
    }
    const commonFieldsValid =
      !!this.userRegistration.city &&
      !!this.userRegistration.state &&
      !!this.userRegistration.pincode &&
      !!this.selectedCountry &&
      !!this.userRegistration.number &&
      !!this.userRegistration.area_code &&
      !!this.userRegistration.email_id &&
      !!this.password &&
      !!this.confirmPassword &&
      this.isPasswordValid() &&
      this.passwordsMatch() &&
      this.captchaInput?.trim();
    if (!commonFieldsValid) return false;
    if (this.userType === 'FPI Applicant') {
      if (this.fpiType === 'yes') {
        const identityValid =
          this.selectedIssuedIdentity &&
          (this.selectedIssuedIdentity.name !== 'Other(please specify)' ||
            (this.selectedIssuedIdentity.name === 'Other(please specify)' &&
              this.userRegistration.specify_other?.trim()));
        return !!(
          this.userRegistration.user_name_fpi_app &&
          identityValid &&
          this.userRegistration.specify_reg &&
          this.userRegistration.dob
        );
      } else if (this.fpiType === 'no') {
        const residencyValid =
          this.selectedResidencyRegistrationNumber &&
          (this.selectedResidencyRegistrationNumber.name !==
            'Other(please specify)' ||
            (this.selectedResidencyRegistrationNumber.name ===
              'Other(please specify)' &&
              this.userRegistration.specify_other?.trim()));
        return !!(
          this.userRegistration.entity_name &&
          this.userRegistration.user_name_fpi_app &&
          residencyValid &&
          this.userRegistration.specify_reg
        );
      }
      return false;
    } else if (this.userType === 'Global Custodian') {
      return !!(
        this.userRegistration.gc_name &&
        this.userRegistration.gc_reg_no &&
        this.userRegistration.gc_name_of_user
      );
    }
    return false;
  }

  isControlRelevant(name: string): boolean {
    if (!this.formControls) return false;
    const control = this.formControls.find((c) => c.name === name);
    if (!control) return false;
    if (this.userType === 'FPI Applicant') {
      if (name === 'global-custodian-name') return false;
      if (this.fpiType === 'yes' && name === 'organisation-name') return false;
      if (this.fpiType === 'no' && name === 'date-of-birth') return false;
    } else if (this.userType === 'Global Custodian') {
      if (name.includes('fpi') || name === 'organisation-name') return false;
    }
    return true;
  }

  markControlGroupAsTouched(groupName: string): void {
    if (!this.formControls) return;
    this.formControls.forEach((control) => {
      if (control.name === groupName) {
        control.control.markAsTouched();
        control.control.markAsDirty();
      }
    });
    if (groupName === 'userType' || groupName === 'fpiType') {
      const errorDetail =
        groupName === 'userType'
          ? 'Please select a user type (FPI Applicant or Global Custodian).'
          : 'Please specify if you are an individual applicant.';
      this.messageService.add({
        severity: 'error',
        summary: 'Selection Required',
        detail: errorDetail,
      });
    }
  }

  markControlsAsTouched(controlNames: string[]): void {
    if (!this.formControls) return;
    this.formControls.forEach((control) => {
      if (controlNames.includes(control.name)) {
        control.control.markAsTouched();
        control.control.markAsDirty();
      }
    });
  }

  showValidationErrors(): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fill in all required fields before proceeding.',
    });
  }

  onNext(activateCallback: (step: number) => void) {
    if (this.isFormValid()) {
      if (!this.validateCaptcha()) {
        this.messageService.add({
          severity: 'error',
          summary: 'CAPTCHA Error',
          detail: 'CAPTCHA did not match. Please try again.',
        });
        this.generateCaptcha();
        return;
      } else {
        activateCallback(2);
        this.scrollToTop();
      }
    } else {
      this.showValidationErrors();
      this.refreshCaptcha();
    }
  }

  generateCaptcha() {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#f3f3f3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.captchaText = Math.random().toString(36).substring(2, 8).toUpperCase();
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = this.getRandomColor();
      ctx.beginPath();
      ctx.moveTo(
        this.randomInt(0, canvas.width),
        this.randomInt(0, canvas.height)
      );
      ctx.lineTo(
        this.randomInt(0, canvas.width),
        this.randomInt(0, canvas.height)
      );
      ctx.stroke();
    }
    for (let i = 0; i < this.captchaText.length; i++) {
      const letter = this.captchaText.charAt(i);
      const x = 20 + i * 20;
      const y = 35;
      const angle = (this.randomInt(-15, 15) * Math.PI) / 180;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = this.getRandomColor();
      ctx.font = '30px Arial';
      ctx.fillText(letter, 0, 0);
      ctx.restore();
    }
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = this.getRandomColor();
      ctx.beginPath();
      ctx.arc(
        this.randomInt(0, canvas.width),
        this.randomInt(0, canvas.height),
        1,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
    this.captcha = canvas.toDataURL();
  }

  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRandomColor(): string {
    const r = this.randomInt(0, 255);
    const g = this.randomInt(0, 255);
    const b = this.randomInt(0, 255);
    return `rgb(${r}, ${g}, ${b})`;
  }

  refreshCaptcha() {
    this.rotationDegree += 360;
    this.generateCaptcha();
    this.captchaInput = '';
  }

  validateCaptcha(): boolean {
    return this.captchaInput.trim().toUpperCase() === this.captchaText;
  }

  resetForm(): void {
    this.userType = '';
    this.fpiType = '';
    this.userRegistration.user_name_fpi_app = '';
    this.userRegistration.entity_name = '';
    this.userRegistration.specify_reg = '';
    this.userRegistration.specify_other = '';
    this.userRegistration.dob = undefined;
    this.userRegistration.gc_name = '';
    this.userRegistration.gc_reg_no = '';
    this.userRegistration.gc_name_of_user = '';
    this.userRegistration.city = '';
    this.userRegistration.state = '';
    this.userRegistration.pincode = '';
    this.userRegistration.number = '';
    this.userRegistration.area_code = '';
    this.userRegistration.email_id = '';
    this.password = '';
    this.confirmPassword = '';
    this.captchaInput = '';
    this.selectedIssuedIdentity = null;
    this.selectedResidencyRegistrationNumber = null;
    // this.selectedCountry = this.countries.find((c) => c.code === '+91') || null;
    // this.selectedCountryCode = this.countryCodes.find(
    //   (c) => c.code === '+91'
    // ) || { code: '+91' };
    this.selectedCountry = null;
    this.selectedCountryCode = null;
    this.passwordValidation = {
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
    };
    if (this.loginForm) {
      const step1Controls = [
        'userType',
        'fpiType',
        'organization-name',
        'user-name',
        'authority-issued-identifier',
        'authority-issued-identifier-other',
        'number-identifier',
        'date-of-birth',
        'organisation-name',
        'residency-registration-number',
        'residency-registration-number-other',
        'global-custodian-name',
        'global-custodian-registration-number',
        'global-custodian-name-of-user',
        'city',
        'state',
        'pincode',
        'country',
        'countryCode',
        'mno',
        'area',
        'userid',
        'password',
        'confirmPassword',
        'captcha',
      ];
      this.formControls.forEach((control) => {
        if (step1Controls.includes(control.name)) {
          control.control.reset();
          control.control.markAsPristine();
          control.control.markAsUntouched();
        }
      });
      this.userRegistration.user_as = UserAsType.FPIINDIVIDUAL;
      // this.selectedCountryCode = { code: '+91' };
    }
    this.messageService.clear();
  }
  
  backToStep(activateCallback: (step: number) => void, step: number): void {
    activateCallback(step);
    this.scrollToTop();
  }
}
