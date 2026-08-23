import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarTorre } from './actualizar-torre';

describe('ActualizarTorre', () => {
  let component: ActualizarTorre;
  let fixture: ComponentFixture<ActualizarTorre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarTorre],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarTorre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
