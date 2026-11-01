import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { Mock, vi } from 'vitest';

import { ExportDownloadModalComponent } from './export-download-modal.component';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { BackupService } from 'app/shared/services/backup.service';
import { NotificationService } from 'app/core/services/notification-service.service';
import { LoadingService } from 'app/core/services/loading.service';

describe('ExportDownloadModalComponent', () => {
  let component: ExportDownloadModalComponent;
  let fixture: ComponentFixture<ExportDownloadModalComponent>;
  let generateResponse: Subject<void>;
  let message: Mock;

  const generateButton = (): HTMLButtonElement =>
    Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Generate',
    )!;

  const clickGenerate = () => {
    generateButton().click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    generateResponse = new Subject<void>();
    const notificationStep = {
      ErrorType: () => notificationStep,
      BottomRight: () => notificationStep,
      Show: vi.fn(),
    };
    message = vi.fn(() => notificationStep);

    await TestBed.configureTestingModule({
      imports: [ExportDownloadModalComponent],
      providers: [
        {
          provide: POLYMORPHEUS_CONTEXT,
          useValue: {
            data: false,
            $implicit: { next: () => undefined, complete: () => undefined },
          },
        },
        {
          provide: BackupService,
          useValue: { generateBackup: () => generateResponse.asObservable() },
        },
        { provide: NotificationService, useValue: { Message: message } },
        {
          provide: LoadingService,
          useValue: { loadingOn: vi.fn(), longLoadingOn: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportDownloadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable Generate while the backup is being generated', () => {
    clickGenerate();

    expect(generateButton().disabled).toBe(true);
  });

  it('should show an error and enable Generate again when generating fails', () => {
    clickGenerate();

    generateResponse.error(new Error('Generate failed'));
    fixture.detectChanges();

    expect(message).toHaveBeenCalledWith('Failed To Generate The Backup', 'Error');
    expect(generateButton().disabled).toBe(false);
  });
});
