export interface GeneralSettingsResponse {
  checkForUpdatesEnabled: boolean;
  automaticUpdatesEnabled: boolean;
  maxBatteryValue: number;
  minBatteryValue: number;
  lastBackupDate?: string | null;
}
