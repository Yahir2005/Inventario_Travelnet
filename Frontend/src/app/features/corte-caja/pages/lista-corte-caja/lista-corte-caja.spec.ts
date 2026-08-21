import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCorteCaja } from './lista-corte-caja';

describe('ListaCorteCaja', () => {
  let component: ListaCorteCaja;
  let fixture: ComponentFixture<ListaCorteCaja>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCorteCaja],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaCorteCaja);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
