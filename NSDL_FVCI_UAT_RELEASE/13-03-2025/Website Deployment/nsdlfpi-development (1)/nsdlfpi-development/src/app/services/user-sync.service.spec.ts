import { TestBed } from '@angular/core/testing';

import { UserSyncService } from './user-sync.service';

describe('UserSyncService', () => {
  let service: UserSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
