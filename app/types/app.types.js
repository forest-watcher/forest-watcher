// @flow
import type { LogoutRequest } from 'types/user.types';
import type { OfflineMeta } from 'types/offline.types';

export type AnyAction = { type: string, payload: any, meta?: OfflineMeta }
export type CoordinatesValue = 'decimal' | 'degrees';

export type AppState = {
  language: ?string,
  synced: false,
  coordinatesFormat: CoordinatesValue,
  showLegend: boolean,
  pristineCacheTooltip: boolean,
  version: string,
  actions: Array<AnyAction>
}

export type AppAction =
  | SetLanguage
  | SetAppSynced
  | SetCoordinatesFormat
  | SetLayersDrawersSection
  | SetPristineCacheTooltip
  | SaveLastActions
  | LogoutRequest;

export type SetLanguage = { type: 'app/SET_LANGUAGE', payload: string };
export type SetAppSynced = { type: 'app/SET_APP_SYNCED', payload: boolean };
export type SetCoordinatesFormat = { type: 'app/SET_COORDINATES_FORMAT', payload: CoordinatesValue };
export type SetLayersDrawersSection = { type: 'app/SET_LAYERS_DRAWER_SECTIONS', payload: boolean };
export type SetPristineCacheTooltip = { type: 'app/SET_PRISTINE_CACHE_TOOLTIP', payload: boolean };
export type SaveLastActions = { type: 'app/SAVE_LAST_ACTIONS', payload: AnyAction };
