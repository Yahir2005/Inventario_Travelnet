import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertarInstalacion } from './insertar-instalacion';

describe('InsertarInstalacion', () => {
  let component: InsertarInstalacion;
  let fixture: ComponentFixture<InsertarInstalacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertarInstalacion],
    }).compileComponents();

    fixture = TestBed.createComponent(InsertarInstalacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
