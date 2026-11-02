import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarPlan } from './actualizar-plan';

describe('ActualizarPlan', () => {
  let component: ActualizarPlan;
  let fixture: ComponentFixture<ActualizarPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarPlan],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarPlan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
