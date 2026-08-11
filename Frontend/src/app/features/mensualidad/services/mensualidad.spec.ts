import { TestBed } from '@angular/core/testing';

import { Mensualidad } from './mensualidad';

describe('Mensualidad', () => {
  let service: Mensualidad;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Mensualidad);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
