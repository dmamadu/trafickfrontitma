import { TestBed } from '@angular/core/testing';

import { ComplaintServiceService } from './complaint-service.service';

describe('ComplaintServiceService', () => {
  let service: ComplaintServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComplaintServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
