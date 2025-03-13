import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const validApplicationIdGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const applicationId = route.queryParamMap.get('applicationId');

  if (!applicationId) {
    // Redirect to application list if the query parameter is missing.
    router.navigate(['/dashboard/application-list']);
    return false;
  }

  return true;
};
