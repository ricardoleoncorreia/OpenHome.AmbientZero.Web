import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { of } from 'rxjs';

import { VersionService } from 'app/shared/services/version.service';
import { ExportDownloadModalComponent } from 'app/core/components/export-download-modal/export-download-modal.component';
import { ImportUploadModalComponent } from 'app/core/components/import-upload-modal/import-upload-modal.component';
import { GeneralSettingsComponent } from './general-settings.component';

describe('GeneralSettingsComponent', () => {
  let component: GeneralSettingsComponent;
  let fixture: ComponentFixture<GeneralSettingsComponent>;
  let open: ReturnType<typeof vi.fn>;

  const clickButton = (name: string) =>
    Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === name)!
      .click();

  beforeEach(async () => {
    open = vi.fn(() => of(undefined));

    await TestBed.configureTestingModule({
      imports: [GeneralSettingsComponent],
      providers: [
        {
          provide: VersionService,
          useValue: { getVersions: vi.fn(() => of([])) },
        },
        { provide: TuiResponsiveDialogService, useValue: { open } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralSettingsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', {
      checkForUpdatesEnabled: true,
      automaticUpdatesEnabled: false,
      maxBatteryValue: 100,
      minBatteryValue: 0,
      lastBackupDate: '2026-10-30T10:00:00',
    });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the export dialog with the last backup date', () => {
    clickButton('Export');

    const [content, options] = open.mock.calls[0];
    expect((content as PolymorpheusComponent<unknown>).component).toBe(
      ExportDownloadModalComponent,
    );
    expect(options).toMatchObject({ label: 'Export Backup', data: '2026-10-30T10:00:00' });
  });

  it('should open the import dialog', () => {
    clickButton('Import');

    const [content, options] = open.mock.calls[0];
    expect((content as PolymorpheusComponent<unknown>).component).toBe(ImportUploadModalComponent);
    expect(options).toMatchObject({ label: 'Import Backup' });
  });
});
