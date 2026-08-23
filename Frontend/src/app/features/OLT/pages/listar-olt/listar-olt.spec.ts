import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarOLT } from './listar-olt';

describe('ListarOLT', () => {
  let component: ListarOLT;
  let fixture: ComponentFixture<ListarOLT>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarOLT],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarOLT);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
