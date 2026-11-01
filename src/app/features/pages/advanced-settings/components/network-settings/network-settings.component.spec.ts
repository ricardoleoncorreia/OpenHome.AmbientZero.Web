import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { NetworkSettingsComponent } from './network-settings.component';
import { AdvancedSettingsService } from 'app/shared/services/advanced-settings.service';
import { NotificationService } from 'app/core/services/notification-service.service';
import { AccessPointSettingsResponse } from 'app/shared/interfaces/access-point-settings-response';

describe('NetworkSettingsComponent', () => {
  let component: NetworkSettingsComponent;
  let fixture: ComponentFixture<NetworkSettingsComponent>;
  let updateNetowrkSettings: ReturnType<typeof vi.fn>;

  const createComponent = async (data: AccessPointSettingsResponse) => {
    fixture = TestBed.createComponent(NetworkSettingsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const field = (label: string): HTMLInputElement =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tui-textfield'))
      .find((textfield) => textfield.querySelector('label')?.textContent?.trim() === label)!
      .querySelector('input')!;

  const typeInto = async (input: HTMLInputElement, value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const save = async () => {
    fixture.nativeElement.querySelector('footer button').click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    updateNetowrkSettings = vi.fn(() => of(undefined));
    const notificationStep = {
      SuccessType: () => notificationStep,
      ErrorType: () => notificationStep,
      BottomRight: () => notificationStep,
      Show: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NetworkSettingsComponent],
      providers: [
        { provide: AdvancedSettingsService, useValue: { updateNetowrkSettings } },
        { provide: NotificationService, useValue: { Message: () => notificationStep } },
      ],
    }).compileComponents();

    await createComponent({
      accessPointName: 'Test access point',
      accessPointPassword: 'test-password',
      accessPointSecurity: 1,
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show channel 6 and country GB when the API returns neither', () => {
    expect(field('Wi-Fi Channel').value).toBe('6');
    expect(field('Country Code').value).toBe('GB');
  });

  it('should show the channel and country returned by the API', async () => {
    await createComponent({
      accessPointName: 'Test access point',
      accessPointPassword: '',
      accessPointSecurity: 0,
      channel: 11,
      country: 'ES',
    });

    expect(field('Wi-Fi Channel').value).toBe('11');
    expect(field('Country Code').value).toBe('ES');
  });

  it('should save the channel and country the user entered', async () => {
    await typeInto(field('Wi-Fi Channel'), '1');
    await typeInto(field('Country Code'), 'es');

    await save();

    expect(updateNetowrkSettings).toHaveBeenCalledWith(
      expect.objectContaining({ ssid: 'Test access point', channel: 1, country: 'ES' }),
    );
  });
});
