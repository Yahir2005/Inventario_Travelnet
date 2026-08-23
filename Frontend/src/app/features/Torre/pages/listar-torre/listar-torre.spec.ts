import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarTorre } from './listar-torre';

describe('ListarTorre', () => {
  let component: ListarTorre;
  let fixture: ComponentFixture<ListarTorre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarTorre],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarTorre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
