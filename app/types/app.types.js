// @flow
import type { LogoutRequest } from 'types/user.types';
import type { OfflineMeta } from 'types/offline.types';

export type AnyAction = { type: string, payload: any, meta?: OfflineMeta }
export type CoordinatesValue = 'decimal' | 'degrees';

export type AppState = {
  language: ?string,
  synced: false,
  coordinatesFormat: CoordinatesValue,
  pristineCacheTooltip: boolean,
  version: string,
  actions: Array<AnyAction>,
  offlineMode: boolean
}

export type AppAction =
  | SetLanguage
  | SetOfflineMode
  | SetAppSynced
  | SetCoordinatesFormat
  | SetPristineCacheTooltip
  | SaveLastActions
  | ShowConnectionRequired
  | ShowOfflineModeIsOn
  | LogoutRequest;

export type SetOfflineMode = { type: 'app/SET_OFFLINE_MODE', payload: boolean };
export type SetLanguage = { type: 'app/SET_LANGUAGE', payload: string };
export type SetAppSynced = { type: 'app/SET_APP_SYNCED', payload: boolean };
export type SetCoordinatesFormat = { type: 'app/SET_COORDINATES_FORMAT', payload: CoordinatesValue };
export type SetPristineCacheTooltip = { type: 'app/SET_PRISTINE_CACHE_TOOLTIP', payload: boolean };
export type SaveLastActions = { type: 'app/SAVE_LAST_ACTIONS', payload: AnyAction };
export type RetrySync = { type: 'app/RETRY_SYNC' };
export type ShowConnectionRequired = { type: 'app/SHOW_CONNECTION_REQUIRED' };
export type ShowOfflineModeIsOn = { type: 'app/SHOW_OFFLINE_MODE_IS_ON' };
