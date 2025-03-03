import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleWindowServicesComponent } from './single-window-services.component';

describe('SingleWindowServicesComponent', () => {
  let component: SingleWindowServicesComponent;
  let fixture: ComponentFixture<SingleWindowServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SingleWindowServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleWindowServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
