import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { validApplicationIdGuard } from './valid-application-id.guard';

describe('validApplicationIdGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => validApplicationIdGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
