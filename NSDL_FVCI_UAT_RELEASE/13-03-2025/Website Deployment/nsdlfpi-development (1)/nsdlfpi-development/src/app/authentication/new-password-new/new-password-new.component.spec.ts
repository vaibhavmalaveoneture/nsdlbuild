import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPasswordNewComponent } from './new-password-new.component';

describe('NewPasswordNewComponent', () => {
  let component: NewPasswordNewComponent;
  let fixture: ComponentFixture<NewPasswordNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewPasswordNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPasswordNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
