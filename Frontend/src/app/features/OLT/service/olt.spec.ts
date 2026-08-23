import { TestBed } from '@angular/core/testing';

import { OLT } from './olt';

describe('OLT', () => {
  let service: OLT;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OLT);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
