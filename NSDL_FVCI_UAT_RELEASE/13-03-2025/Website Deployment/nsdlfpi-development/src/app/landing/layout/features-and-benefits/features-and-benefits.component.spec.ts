import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesAndBenefitsComponent } from './features-and-benefits.component';

describe('FeaturesAndBenefitsComponent', () => {
  let component: FeaturesAndBenefitsComponent;
  let fixture: ComponentFixture<FeaturesAndBenefitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeaturesAndBenefitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturesAndBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
