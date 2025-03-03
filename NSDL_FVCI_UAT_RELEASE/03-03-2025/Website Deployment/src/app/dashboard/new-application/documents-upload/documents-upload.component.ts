import { Component, inject, Input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FileUploadEvent } from 'primeng/fileupload';

interface FileData {
  name: string;
  doc: string;
  uploadedBy: string;
  uploadedDate: string;
}

@Component({
  selector: 'app-documents-upload',
  standalone: false,
  templateUrl: './documents-upload.component.html',
  styleUrl: './documents-upload.component.scss',
})
export class DocumentsUploadComponent {
  @Input() applicationId: string | undefined;
  download: string = '/assets/downloads.png';
  files: FileData[] = [];
  representative: FileData[] = [];
  uploadedFiles: any[] = [];

  private readonly messageService = inject(MessageService);

  ngOnInit() {
    this.representative = [];
  }

  onUpload(event: FileUploadEvent) {
    if (event.files && event.files.length > 0) {
      for (let file of event.files) {
        const newFileEntry: FileData = {
          name: file.name,
          doc: 'Aadhar Card',
          uploadedBy: 'Current User',
          uploadedDate: new Date().toLocaleString(),
        };

        this.files = [...this.files, newFileEntry];

        this.uploadedFiles.push(file);
      }

      this.messageService.add({
        severity: 'success',
        summary: 'File Uploaded',
        detail: 'Document(s) added successfully',
      });
    }
  }

  onSelect(event: any) {
    const files: File[] = event.files;
    const invalidFiles = files.filter(
      (file) => file.type !== 'application/pdf'
    );

    if (invalidFiles.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid File Type',
        detail: 'Only PDF files are allowed!',
      });
      const fileUpload = document.querySelector('p-fileupload') as any;
      if (fileUpload) {
        fileUpload.clear();
      }
      return;
    }
  }
}
