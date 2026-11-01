export interface AccessPointSettingsResponse {
  accessPointName: string;
  accessPointPassword: string;
  accessPointSecurity: number;
  channel?: number;
  country?: string;
}
