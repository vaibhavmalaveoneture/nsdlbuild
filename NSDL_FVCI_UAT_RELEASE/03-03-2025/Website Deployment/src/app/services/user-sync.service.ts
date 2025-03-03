import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  AdminService,
  AuthService,
  CommonService,
  FvciApplicationService,
  LoginRequestDto,
  SendOtpDto,
  UpdateDdpDto,
  UserRegistrationDto,
  VerifyOtpRequest,
} from '../../swagger';
import { firstValueFrom } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserSyncService {
  private token: string = '';

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
    private readonly commonService: CommonService,
    private readonly fvciService: FvciApplicationService
  ) {}

  ngOnInit(): void {
    this.loadState();
  }

  loadState() {
    this.token = localStorage.getItem('token')!;
    this.initApis(this.token);
  }

  /**
   * Validate user session by calling `/profile/me`
   * - If session is valid, returns user profile
   * - If session is invalid, logs out user and returns `null`
   */
  public async validateSessionAndGetProfile(): Promise<any | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    this.initApis(token);

    try {
      const response = await firstValueFrom(
        this.commonService.apiCommonMeGet()
      );

      if (!response || !response.success) {
        throw new Error(response?.message || 'Session validation failed');
      }

      return response; // Return user profile
    } catch (error: any) {
      console.error('Session validation failed:', error);

      // Handle session expiration and logout the user
      this.logout();
      return null;
    }
  }

  public async getUserPermissions(): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.authService.apiAuthUserPermissionsGet()
      );

      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to retrieve permissions');
      }

      return response.data.permissions; // Return list of permission codes
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  }

  async sendForgotPasswordOTP(credentials: { email_id: string }) {
    try {
      const res = await firstValueFrom(
        this.authService.apiAuthForgotPasswordSendOtpPost(credentials)
      );
      if (res && res.message === 'Password reset OTP sent to email') {
        sessionStorage.setItem('userEmail', credentials.email_id);
        sessionStorage.setItem('action', 'forgotpassword');
        // To Do Refresh Token
        return { success: true, message: res.message };
      } else {
        throw new Error('Invalid employee code!');
      }
    } catch (error) {
      console.error('Error during sending OTP:', error);
      return { success: false, message: error };
    }
  }

  async verifyForgotPasswordOTP(otp: string, email: string) {
    try {
      const payload = {
        email_id: email,
        otp: otp,
      };
      const res = await firstValueFrom(
        this.authService.apiAuthForgotPasswordVerifyOtpPost(payload)
      );
      if (res && res.successs) {
        sessionStorage.setItem('userToken', res.data);
        this.initApis(res.token);
        // Redirect to setPassword component
        this.router.navigate(['/auth/set-password']);
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error: any) {
      return error.error;
    }
  }

  async register(userRegistration: UserRegistrationDto): Promise<any> {
    try {
      // Forward the registration request to the backend via AuthService.
      const res: any = await firstValueFrom(
        this.authService.apiAuthRegisterPost(userRegistration)
      );

      // Based on your backend:
      // Successful registration returns success=true and message "User registered successfully!"
      if (res && res.success === true) {
        // Store the email for later OTP verification.
        sessionStorage.setItem('userEmail', userRegistration.email_id);
        return {
          success: true,
          message: res.message || 'User registered successfully!',
        };
      } else {
        return {
          success: false,
          message: res.message || 'Registration failed.',
        };
      }
    } catch (error: any) {
      console.error('Error during signup:', error);
      if (error.status === 400) {
        return {
          success: false,
          message: 'Invalid input or email already registered.',
        };
      } else if (error.status === 409) {
        return {
          success: false,
          message: 'Email or mobile number already registered.',
        };
      } else if (error.status === 500) {
        return {
          success: false,
          message: 'Internal server error, please try again later.',
        };
      } else {
        return { success: false, message: 'An unknown error occurred.' };
      }
    }
  }

  async sendOtp(request: SendOtpDto): Promise<any> {
    try {
      const res: any = await firstValueFrom(
        this.authService.apiAuthSendOtpPost(request)
      );
      return res;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      if (error.status === 400) {
        return { success: false, message: 'Failed to send OTP email.' };
      } else if (error.status === 500) {
        return {
          success: false,
          message: 'Internal server error while sending OTP.',
        };
      } else {
        return {
          success: false,
          message: 'An unknown error occurred while sending OTP.',
        };
      }
    }
  }

  async verifyOtp(payload: VerifyOtpRequest): Promise<any> {
    try {
      const res: any = await firstValueFrom(
        this.authService.apiAuthVerifyOtpPost(payload)
      );
      if (res && res.success) {
        // Assume res.data is an object containing the token, e.g. { token: 'your-jwt-token' }
        sessionStorage.setItem('jwtToken', res.data);
        sessionStorage.removeItem('userEmail');
        return {
          success: true,
          message: res.message || 'OTP verified successfully.',
        };
      } else {
        return {
          success: false,
          message: res.message || 'OTP verification failed.',
        };
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      if (error.status === 400) {
        return { success: false, message: 'Invalid OTP.' };
      } else if (error.status === 500) {
        return {
          success: false,
          message: 'Internal server error while verifying OTP.',
        };
      } else {
        return {
          success: false,
          message: 'An unknown error occurred while verifying OTP.',
        };
      }
    }
  }

  async updateDDP(updateDdpDto: UpdateDdpDto): Promise<any> {
    try {
      this.initApis(sessionStorage.getItem('jwtToken')!);
      const res: any = await firstValueFrom(
        this.authService.apiAuthUpdateDdpPut(updateDdpDto)
      );
      if (res && res.success) {
        sessionStorage.clear();
      }
      return res;
    } catch (error: any) {
      console.error('Error updating DDP:', error);
      return error.error; // or a structured error response
    }
  }

  async setNewPassword(credentials: {
    newPassword: string;
    confirmPassword: string;
  }) {
    try {
      // Setting the Authorization header with the user token
      const headers = new HttpHeaders({
        Authorization: `Bearer ${sessionStorage.getItem('userToken')}`,
      });
      this.authService.defaultHeaders = headers;

      // Sending the request to set the new password
      const res: any = await firstValueFrom(
        this.authService.apiAuthForgotPasswordSetNewPasswordPost(credentials)
      );

      // Checking if the response is successful based on the Swagger response message
      if (res && res.message === 'Password set successfully') {
        return { success: true, message: res.message }; // Password set successfully
      } else {
        throw new Error('Password validation failed or token expired password');
      }
    } catch (err: any) {
      // Error handling based on different response codes
      console.error(err);

      if (err.status === 400) {
        return { success: false, message: 'Invalid email or password' };
      } else if (err.status === 500) {
        return { success: false, message: 'Internal server error' };
      } else {
        return {
          success: false,
          message: err.message || 'An unknown error occurred',
        };
      }
    }
  }

  async checkActiveSessions(loginRequest: LoginRequestDto) {
    try {
      const res: any = await firstValueFrom(
        this.authService.apiAuthCheckActiveSessionPost(loginRequest)
      );
      if (res?.success) {
        return res.data;
      } else {
        throw new Error('Failed to fetch active sessions');
      }
    } catch (error: any) {
      console.error('Error fetching active sessions:', error);
      return error.error;
    }
  }

  async login(loginRequest: LoginRequestDto) {
    try {
      // Send login request via authService
      const res: any = await firstValueFrom(
        this.authService.apiAuthLoginPost(loginRequest)
      );

      // Check if the response contains the token
      if (res?.success && res.data) {
        this.token = res.data;
        localStorage.removeItem('token');
        localStorage.setItem('token', this.token); // Store token in localStorage
        sessionStorage.clear(); // Clear session storage
        sessionStorage.removeItem('credentials'); // Remove credentials

        // To Do: Implement refresh token mechanism if required

        this.initApis(this.token); // Initialize APIs with the new token
        return res;
      } else {
        throw new Error('Token not received in the response');
      }
    } catch (error) {
      console.error('Error during login:', error);
      throw error; // Re-throw the error after logging it
    }
  }

  async forgotPassword(email: string) {}

  private initApis(token: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.authService.defaultHeaders = headers;
    this.commonService.defaultHeaders = headers;
    this.adminService.defaultHeaders = headers;
    this.fvciService.defaultHeaders = headers;
  }

  public async logout() {
    sessionStorage.clear();
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    // localStorage.clear();
    this.router.navigate(['/auth']);
  }
}
