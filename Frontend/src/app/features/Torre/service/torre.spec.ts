import { TestBed } from '@angular/core/testing';

import { Torre } from './torre';

describe('Torre', () => {
  let service: Torre;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Torre);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
