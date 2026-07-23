import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaInstalacion } from './lista-instalacion';

describe('ListaInstalacion', () => {
  let component: ListaInstalacion;
  let fixture: ComponentFixture<ListaInstalacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaInstalacion],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaInstalacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
