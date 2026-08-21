import { TestBed } from '@angular/core/testing';

import { CorteCaja } from './corte-caja';

describe('CorteCaja', () => {
  let service: CorteCaja;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CorteCaja);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
