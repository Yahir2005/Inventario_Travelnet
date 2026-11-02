import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertarPlan } from './insertar-plan';

describe('InsertarPlan', () => {
  let component: InsertarPlan;
  let fixture: ComponentFixture<InsertarPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertarPlan],
    }).compileComponents();

    fixture = TestBed.createComponent(InsertarPlan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
