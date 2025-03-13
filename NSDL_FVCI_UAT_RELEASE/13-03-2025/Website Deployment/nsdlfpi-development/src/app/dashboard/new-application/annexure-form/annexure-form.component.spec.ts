import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnexureFormComponent } from './annexure-form.component';

describe('AnnexureFormComponent', () => {
  let component: AnnexureFormComponent;
  let fixture: ComponentFixture<AnnexureFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnexureFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnexureFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
