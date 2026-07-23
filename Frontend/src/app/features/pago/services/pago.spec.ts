import { TestBed } from '@angular/core/testing';

import { Pago } from './pago';

describe('Pago', () => {
  let service: Pago;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pago);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
