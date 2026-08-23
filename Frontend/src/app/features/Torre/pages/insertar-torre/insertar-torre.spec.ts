import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertarTorre } from './insertar-torre';

describe('InsertarTorre', () => {
  let component: InsertarTorre;
  let fixture: ComponentFixture<InsertarTorre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertarTorre],
    }).compileComponents();

    fixture = TestBed.createComponent(InsertarTorre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
