import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsUploadComponent } from './documents-upload.component';

describe('DocumentsUploadComponent', () => {
  let component: DocumentsUploadComponent;
  let fixture: ComponentFixture<DocumentsUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentsUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentsUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
