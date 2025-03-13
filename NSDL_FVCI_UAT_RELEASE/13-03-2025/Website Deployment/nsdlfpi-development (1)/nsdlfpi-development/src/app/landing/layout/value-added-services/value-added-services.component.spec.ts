import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueAddedServicesComponent } from './value-added-services.component';

describe('ValueAddedServicesComponent', () => {
  let component: ValueAddedServicesComponent;
  let fixture: ComponentFixture<ValueAddedServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValueAddedServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValueAddedServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
