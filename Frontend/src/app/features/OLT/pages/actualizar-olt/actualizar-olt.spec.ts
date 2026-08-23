import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarOLT } from './actualizar-olt';

describe('ActualizarOLT', () => {
  let component: ActualizarOLT;
  let fixture: ComponentFixture<ActualizarOLT>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarOLT],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarOLT);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
