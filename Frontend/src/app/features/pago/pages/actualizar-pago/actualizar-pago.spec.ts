import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarPago } from './actualizar-pago';

describe('ActualizarPago', () => {
  let component: ActualizarPago;
  let fixture: ComponentFixture<ActualizarPago>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarPago],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarPago);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
