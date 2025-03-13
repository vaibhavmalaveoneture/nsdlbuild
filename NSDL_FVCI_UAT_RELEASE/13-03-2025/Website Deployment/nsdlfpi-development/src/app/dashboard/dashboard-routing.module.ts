import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewApplicationComponent } from './new-application/new-application.component';
import { ApplicationListComponent } from './application-list/application-list.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { validApplicationIdGuard } from '../guards/valid-application-id.guard';
import { isLoggedIn } from '../guards/isLoggedIn.guard';

const routes: Routes = [
  { path: '', redirectTo: 'user-management', pathMatch: 'full' },
  {
    path: 'application-list',
    component: ApplicationListComponent,
    canActivate: [isLoggedIn],
  },
  {
    path: 'new-application',
    component: NewApplicationComponent,
    canActivate: [validApplicationIdGuard],
  },
  {
    path: 'user-management',
    component: UserManagementComponent,
    canActivate: [isLoggedIn],
  },
  { path: '**', redirectTo: 'user-management' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
