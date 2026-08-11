import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertarUsuario } from './insertar-usuario';

describe('InsertarUsuario', () => {
  let component: InsertarUsuario;
  let fixture: ComponentFixture<InsertarUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertarUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(InsertarUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
