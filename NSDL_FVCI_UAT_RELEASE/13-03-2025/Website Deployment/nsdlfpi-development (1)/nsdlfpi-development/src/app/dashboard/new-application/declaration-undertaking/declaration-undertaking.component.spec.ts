import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarationUndertakingComponent } from './declaration-undertaking.component';

describe('DeclarationUndertakingComponent', () => {
  let component: DeclarationUndertakingComponent;
  let fixture: ComponentFixture<DeclarationUndertakingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeclarationUndertakingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeclarationUndertakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
