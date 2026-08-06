import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertarImagenInstalacion } from './insertar-imagen-instalacion';

describe('InsertarImagenInstalacion', () => {
  let component: InsertarImagenInstalacion;
  let fixture: ComponentFixture<InsertarImagenInstalacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertarImagenInstalacion],
    }).compileComponents();

    fixture = TestBed.createComponent(InsertarImagenInstalacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
