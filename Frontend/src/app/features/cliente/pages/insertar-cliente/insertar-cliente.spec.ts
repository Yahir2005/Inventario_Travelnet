import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertarCliente } from './insertar-cliente';

describe('InsertarCliente', () => {
  let component: InsertarCliente;
  let fixture: ComponentFixture<InsertarCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertarCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(InsertarCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
