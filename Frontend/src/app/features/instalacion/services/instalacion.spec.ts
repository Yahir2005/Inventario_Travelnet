import { TestBed } from '@angular/core/testing';

import { Instalacion } from './instalacion';

describe('Instalacion', () => {
  let service: Instalacion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Instalacion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
