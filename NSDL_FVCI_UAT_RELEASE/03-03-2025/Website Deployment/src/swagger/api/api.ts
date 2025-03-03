export * from './admin.service';
import { AdminService } from './admin.service';
export * from './auth.service';
import { AuthService } from './auth.service';
export * from './common.service';
import { CommonService } from './common.service';
export * from './fvciApplication.service';
import { FvciApplicationService } from './fvciApplication.service';
export const APIS = [AdminService, AuthService, CommonService, FvciApplicationService];
