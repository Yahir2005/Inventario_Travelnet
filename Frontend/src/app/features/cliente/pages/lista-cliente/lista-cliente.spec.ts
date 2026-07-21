import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCliente } from './lista-cliente';

describe('ListaCliente', () => {
  let component: ListaCliente;
  let fixture: ComponentFixture<ListaCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
