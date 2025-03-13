import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { UserSyncService } from '../services/user-sync.service';

export const isLoggedIn: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const userSyncService = inject(UserSyncService);

  const token = localStorage.getItem('token');

  // Allow access to public routes (landing & auth) if not logged in
  const isPublicRoute =
    route.routeConfig?.path?.startsWith('landing') ||
    route.routeConfig?.path?.startsWith('auth');

  if (!token) {
    return isPublicRoute ? true : router.parseUrl('/landing');
  }

  try {
    const userProfile = await userSyncService.validateSessionAndGetProfile();
    if (!userProfile) {
      userSyncService.logout();
      return router.parseUrl('/landing');
    }

    const userPermissions = await userSyncService.getUserPermissions();

    // Define required permissions for restricted routes
    const requiredPermissions: Record<string, string[]> = {
      '/dashboard/user-management': ['view_users'],
    };

    const currentUrl = state.url;
    const restrictedRoute = Object.keys(requiredPermissions).find((route) =>
      currentUrl.includes(route)
    );

    if (
      restrictedRoute &&
      !userPermissions.some((perm) =>
        requiredPermissions[restrictedRoute].includes(perm)
      )
    ) {
      return router.parseUrl('/dashboard/application-list');
    }

    // Redirect logged-in users from landing/auth to dashboard
    return isPublicRoute ? router.parseUrl('/dashboard') : true;
  } catch (error) {
    console.error('Auth Guard Error:', error);
    userSyncService.logout();
    return router.parseUrl('/landing');
  }
};
