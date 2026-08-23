import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarCorteCaja } from './actualizar-corte-caja';

describe('ActualizarCorteCaja', () => {
  let component: ActualizarCorteCaja;
  let fixture: ComponentFixture<ActualizarCorteCaja>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarCorteCaja],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarCorteCaja);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
