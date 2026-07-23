import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPago } from './lista-pago';

describe('ListaPago', () => {
  let component: ListaPago;
  let fixture: ComponentFixture<ListaPago>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaPago],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaPago);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
