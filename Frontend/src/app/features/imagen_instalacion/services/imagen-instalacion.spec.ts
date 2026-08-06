import { TestBed } from '@angular/core/testing';

import { ImagenInstalacionService } from './imagen-instalacion';

describe('ImagenInstalacion', () => {
  let service: ImagenInstalacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagenInstalacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
