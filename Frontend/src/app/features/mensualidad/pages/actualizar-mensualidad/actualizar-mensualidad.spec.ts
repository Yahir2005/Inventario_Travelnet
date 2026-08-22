import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarMensualidad } from './actualizar-mensualidad';

describe('ActualizarMensualidad', () => {
  let component: ActualizarMensualidad;
  let fixture: ComponentFixture<ActualizarMensualidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarMensualidad],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarMensualidad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
