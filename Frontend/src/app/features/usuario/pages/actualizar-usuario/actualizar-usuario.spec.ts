import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarUsuario } from './actualizar-usuario';

describe('ActualizarUsuario', () => {
  let component: ActualizarUsuario;
  let fixture: ComponentFixture<ActualizarUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualizarUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
