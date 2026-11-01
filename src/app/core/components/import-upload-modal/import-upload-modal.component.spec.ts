import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { ImportUploadModalComponent } from './import-upload-modal.component';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { BackupService } from 'app/shared/services/backup.service';
import { NotificationService } from 'app/core/services/notification-service.service';

describe('ImportUploadModalComponent', () => {
  let component: ImportUploadModalComponent;
  let fixture: ComponentFixture<ImportUploadModalComponent>;
  let importBackup: ReturnType<typeof vi.fn>;
  let complete: ReturnType<typeof vi.fn>;
  let file: File;

  const importButton = (): HTMLButtonElement =>
    Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('footer button')).find(
      (button) => button.textContent?.trim() === 'Import',
    )!;

  const selectFile = async () => {
    const fileUpload = fixture.debugElement.query(By.directive(FileUploadComponent))
      .componentInstance as FileUploadComponent;
    fileUpload.file.set(file);
    fileUpload.fileChanged.emit(true);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    importBackup = vi.fn(() => of(undefined));
    complete = vi.fn();
    file = new File(['select 1;'], 'backup.sql');
    const notificationStep = {
      SuccessType: () => notificationStep,
      ErrorType: () => notificationStep,
      BottomRight: () => notificationStep,
      Show: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ImportUploadModalComponent],
      providers: [
        {
          provide: POLYMORPHEUS_CONTEXT,
          useValue: {
            data: false,
            $implicit: { next: () => undefined, complete },
          },
        },
        { provide: BackupService, useValue: { importBackup } },
        { provide: NotificationService, useValue: { Message: () => notificationStep } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep Import disabled until a file is uploaded', () => {
    expect(importButton().disabled).toBe(true);
  });

  it('should import the uploaded file and close the dialog', async () => {
    await selectFile();

    importButton().click();

    expect(importBackup).toHaveBeenCalledWith(file);
    expect(complete).toHaveBeenCalled();
  });

  it('should keep the dialog open when the import fails', async () => {
    importBackup.mockReturnValue(throwError(() => new Error('import failed')));
    await selectFile();

    importButton().click();

    expect(complete).not.toHaveBeenCalled();
  });
});
