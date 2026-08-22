import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarInstalacion } from './actualizar-instalacion';

describe('ActualizarInstalacion', () => {
  let component: ActualizarInstalacion;
  let fixture: ComponentFixture<ActualizarInstalacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarInstalacion],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarInstalacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
