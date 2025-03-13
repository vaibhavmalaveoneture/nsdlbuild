import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FvciFormComponent } from './fvci-form.component';

describe('FvciFormComponent', () => {
  let component: FvciFormComponent;
  let fixture: ComponentFixture<FvciFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FvciFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FvciFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
