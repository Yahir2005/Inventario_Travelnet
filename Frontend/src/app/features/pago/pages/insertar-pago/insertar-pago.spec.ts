import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertarPago } from './insertar-pago';

describe('InsertarPago', () => {
  let component: InsertarPago;
  let fixture: ComponentFixture<InsertarPago>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertarPago],
    }).compileComponents();

    fixture = TestBed.createComponent(InsertarPago);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
