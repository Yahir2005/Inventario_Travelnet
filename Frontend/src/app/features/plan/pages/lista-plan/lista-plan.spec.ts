import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPlan } from './lista-plan';

describe('ListaPlan', () => {
  let component: ListaPlan;
  let fixture: ComponentFixture<ListaPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaPlan],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaPlan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
