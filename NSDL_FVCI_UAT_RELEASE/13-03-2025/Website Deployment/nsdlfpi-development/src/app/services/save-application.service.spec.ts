import { TestBed } from '@angular/core/testing';

import { SaveApplicationService } from './save-application.service';

describe('SaveApplicationService', () => {
  let service: SaveApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaveApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
