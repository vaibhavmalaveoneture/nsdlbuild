import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhyNsdlComponent } from './why-nsdl.component';

describe('WhyNsdlComponent', () => {
  let component: WhyNsdlComponent;
  let fixture: ComponentFixture<WhyNsdlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WhyNsdlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhyNsdlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
