// @flow
import type { LogoutRequest } from 'types/user.types';
import type { OfflineMeta } from 'types/offline.types';

export type AnyAction = { type: string, payload: any, meta?: OfflineMeta };
export type CoordinatesValue = 'decimal' | 'degrees';

export type LoginProvider = 'apple' | 'email' | 'facebook' | 'twitter' | 'google';

export type AppUpdateType = {
  shouldUpdate: boolean,
  url: string,
  lastUpdate: ?Date
};

export type AppState = {
  isUpdate: boolean,
  language: string,
  synced: false,
  syncing: number,
  coordinatesFormat: CoordinatesValue,
  hasSeenWelcomeScreen: boolean,
  pristineCacheTooltip: boolean,
  reduxVersion: number, // Used to control Redux state migrations
  version: string,
  areaCountryTooltipSeen: boolean,
  areaDownloadTooltipSeen: boolean,
  mapWalkthroughSeen: boolean,
  offlineMode: boolean,
  hasMigratedV1Files: boolean,
  welcomeSeenVersion: ?string,
  needsAppUpdate: AppUpdateType
};

export type AppAction =
  | SetLanguage
  | SetOfflineMode
  | SetAreaCountryTooltipSeen
  | SetAreaDownloadTooltipSeen
  | SetAppSynced
  | SetAppSyncing
  | DecreaseAppSyncing
  | SetHasSeenWelcomeScreen
  | SetCoordinatesFormat
  | SetPristineCacheTooltip
  | SetHasMigratedV1Files
  | SetMapWalkthroughSeen
  | ShowConnectionRequired
  | ShowOfflineModeIsOn
  | LogoutRequest
  | ShowExportReportsSuccessfulNotification
  | SharingBundleImported
  | UpdateApp
  | SetNeedsAppUpdate;

export type SetOfflineMode = { type: 'app/SET_OFFLINE_MODE', payload: boolean };
export type SetLanguage = { type: 'app/SET_LANGUAGE', payload: string };
export type SetAreaCountryTooltipSeen = { type: 'app/SET_AREA_COUNTRY_TOOLTIP_SEEN', payload: boolean };
export type SetAreaDownloadTooltipSeen = { type: 'app/SET_AREA_DOWNLOAD_TOOLTIP_SEEN', payload: boolean };
export type SetAppSynced = { type: 'app/SET_APP_SYNCED', payload: boolean };
export type SetAppSyncing = { type: 'app/SET_APP_SYNCING', payload: number };
export type DecreaseAppSyncing = { type: 'app/DECREASE_APP_SYNCING' };
export type SetHasSeenWelcomeScreen = { type: 'app/SET_WELCOME_SEEN', payload: string };
export type SetCoordinatesFormat = { type: 'app/SET_COORDINATES_FORMAT', payload: CoordinatesValue };
export type SetPristineCacheTooltip = { type: 'app/SET_PRISTINE_CACHE_TOOLTIP', payload: boolean };
export type SetMapWalkthroughSeen = { type: 'app/SET_MAP_WALKTHROUGH_SEEN', payload: boolean };
export type SetHasMigratedV1Files = { type: 'app/SET_HAS_MIGRATED_V1_FILES' };
export type RetrySync = { type: 'app/RETRY_SYNC' };
export type ShowConnectionRequired = { type: 'app/SHOW_CONNECTION_REQUIRED' };
export type ShowOfflineModeIsOn = { type: 'app/SHOW_OFFLINE_MODE_IS_ON' };
export type ShowExportReportsSuccessfulNotification = { type: 'app/EXPORT_REPORTS_SUCCESSFUL' };
export type UpdateApp = { type: 'app/UPDATE_APP' };
export type SharingBundleImported = {|
  type: 'app/SHARING_BUNDLE_IMPORT_SUCCESSFUL',
  payload: {
    summary: string
  }
|};
export type SetNeedsAppUpdate = { type: 'app/SET_NEEDS_APP_UPDATE', payload: AppUpdateType };
