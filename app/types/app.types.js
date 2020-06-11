// @flow
import type { LogoutRequest } from 'types/user.types';
import type { OfflineMeta } from 'types/offline.types';

export type AnyAction = { type: string, payload: any, meta?: OfflineMeta };
export type CoordinatesValue = 'decimal' | 'degrees';

export type AppState = {
  isUpdate: boolean,
  language: ?string,
  synced: false,
  coordinatesFormat: CoordinatesValue,
  hasSeenWelcomeScreen: boolean,
  pristineCacheTooltip: boolean,
  version: string,
  actions: Array<AnyAction>,
  areaCountryTooltipSeen: boolean,
  areaDownloadTooltipSeen: boolean,
  mapWalkthroughSeen: boolean,
  offlineMode: boolean
};

export type AppAction =
  | SetLanguage
  | SetOfflineMode
  | SetAreaCountryTooltipSeen
  | SetAreaDownloadTooltipSeen
  | SetAppSynced
  | SetHasSeenWelcomeScreen
  | SetCoordinatesFormat
  | SetPristineCacheTooltip
  | SetMapWalkthroughSeen
  | SaveLastActions
  | ShowConnectionRequired
  | ShowOfflineModeIsOn
  | LogoutRequest
  | ShowExportReportsSuccessfulNotification
  | SharingBundleImported
  | UpdateApp;

export type SetOfflineMode = { type: 'app/SET_OFFLINE_MODE', payload: boolean };
export type SetLanguage = { type: 'app/SET_LANGUAGE', payload: string };
export type SetAreaCountryTooltipSeen = { type: 'app/SET_AREA_COUNTRY_TOOLTIP_SEEN', payload: boolean };
export type SetAreaDownloadTooltipSeen = { type: 'app/SET_AREA_DOWNLOAD_TOOLTIP_SEEN', payload: boolean };
export type SetAppSynced = { type: 'app/SET_APP_SYNCED', payload: boolean };
export type SetHasSeenWelcomeScreen = { type: 'app/SET_WELCOME_SEEN', payload: boolean };
export type SetCoordinatesFormat = { type: 'app/SET_COORDINATES_FORMAT', payload: CoordinatesValue };
export type SetPristineCacheTooltip = { type: 'app/SET_PRISTINE_CACHE_TOOLTIP', payload: boolean };
export type SetMapWalkthroughSeen = { type: 'app/SET_MAP_WALKTHROUGH_SEEN', payload: boolean };
export type SaveLastActions = { type: 'app/SAVE_LAST_ACTIONS', payload: AnyAction };
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
