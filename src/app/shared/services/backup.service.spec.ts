import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { BackupService } from './backup.service';

describe('BackupService', () => {
  let service: BackupService;
  let httpTesting: HttpTestingController;
  let file: File;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BackupService);
    httpTesting = TestBed.inject(HttpTestingController);
    file = new File(['select 1;'], 'backup.sql');
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload the import file as "file"', () => {
    service.uploadImportFile(file).subscribe();

    const request = httpTesting.expectOne({ method: 'POST', url: '/api/Backup' });
    expect((request.request.body as FormData).get('file')).toBe(file);
    request.flush(null);
  });

  it('should import the backup sending the file as "backup"', () => {
    service.importBackup(file).subscribe();

    const request = httpTesting.expectOne({ method: 'POST', url: '/api/Backup/ImportBackup' });
    expect((request.request.body as FormData).get('backup')).toBe(file);
    request.flush(null);
  });

  it('should start generating a backup', () => {
    service.generateBackup().subscribe();

    httpTesting.expectOne({ method: 'GET', url: '/api/Backup/GenerateBackup' }).flush(null);
  });

  it('should download the backup as a blob', () => {
    service.downloadBackup().subscribe();

    const request = httpTesting.expectOne({ method: 'GET', url: '/api/Backup/DownloadBackup' });
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob());
  });
});
