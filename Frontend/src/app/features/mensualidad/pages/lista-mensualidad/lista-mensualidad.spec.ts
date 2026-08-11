import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaMensualidad } from './lista-mensualidad';

describe('ListaMensualidad', () => {
  let component: ListaMensualidad;
  let fixture: ComponentFixture<ListaMensualidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaMensualidad],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaMensualidad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
