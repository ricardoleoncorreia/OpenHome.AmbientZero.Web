import { Component, inject, ViewChild } from '@angular/core';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { TuiButton } from '@taiga-ui/core';
import { BackupService } from 'app/shared/services/backup.service';
import { NotificationService } from 'app/core/services/notification-service.service';

@Component({
  selector: 'app-import-upload-modal',
  imports: [FileUploadComponent, TuiButton],
  templateUrl: './import-upload-modal.component.html',
  styleUrl: './import-upload-modal.component.less',
})
export class ImportUploadModalComponent {
  @ViewChild(FileUploadComponent)
  fileUpload!: FileUploadComponent;
  protected hasFile: boolean = false;
  protected readonly context = injectContext<TuiDialogContext<void, string>>();
  private readonly backupService = inject(BackupService);
  private readonly notificationService = inject(NotificationService);

  fileChanged(fileStatus: boolean) {
    this.hasFile = fileStatus;
  }

  submit() {
    const file = this.fileUpload.file();

    if (!file) {
      return;
    }

    this.backupService.importBackup(file).subscribe({
      next: () => {
        this.notificationService
          .Message('Backup Imported Successfully', 'Success')
          .SuccessType()
          .BottomRight()
          .Show();
        this.fileUpload.reset();
        this.context.$implicit.complete();
      },
      error: () => {
        this.notificationService
          .Message('Failed To Import The Backup', 'Error')
          .ErrorType()
          .BottomRight()
          .Show();
      },
    });
  }
}
