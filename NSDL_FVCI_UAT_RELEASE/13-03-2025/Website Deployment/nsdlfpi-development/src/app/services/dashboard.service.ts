import { Injectable, Optional, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, shareReplay } from 'rxjs';
import { BASE_PATH } from '../../swagger';
import { Configuration } from '../../swagger';

export interface DashboardData {
  counts: {
    total_fpi_count: number;
    total_fvci_count: number;
  };
  countries: {
    name: string;
    total_count: number;
    flag_link: string;
  }[];
}

export interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: DashboardData;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  protected basePath = '/';
  private cachedData$: Observable<ApiResponse> | null = null;

  constructor(
    protected httpClient: HttpClient,
    @Optional() @Inject(BASE_PATH) basePath: string,
    @Optional() configuration: Configuration
  ) {
    if (basePath) {
      this.basePath = basePath;
    }
    if (configuration) {
      this.basePath = basePath || configuration.basePath || this.basePath;
    }
  }

  /**
   * Gets dashboard data from the API
   * Uses caching to avoid multiple requests for the same data
   */
  getDashboardData(): Observable<ApiResponse> {
    const url = `${this.basePath}/api/dashboard/GetDashboardData`;

    if (!this.cachedData$) {
      // If no cached data, make the HTTP request and cache the result
      this.cachedData$ = this.httpClient.get<ApiResponse>(url).pipe(
        shareReplay(1),
        catchError((error) => {
          console.error('Error fetching dashboard data:', error);
          // Return a fallback response with default values
          return of({
            statusCode: 500,
            success: false,
            message: 'Error fetching data',
            data: {
              counts: {
                total_fpi_count: 3000,
                total_fvci_count: 500,
              },
              countries: [],
            },
          });
        })
      );
    }

    return this.cachedData$;
  }

  /**
   * Clears the cached dashboard data, forcing a new request on next call
   */
  clearCache(): void {
    this.cachedData$ = null;
  }
}
