import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertarOLT } from './insertar-olt';

describe('InsertarOLT', () => {
  let component: InsertarOLT;
  let fixture: ComponentFixture<InsertarOLT>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertarOLT],
    }).compileComponents();

    fixture = TestBed.createComponent(InsertarOLT);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
