// @flow
import type { Dispatch, GetState, Thunk } from 'types/store.types';
import type { AppState, AppAction, CoordinatesValue } from 'types/app.types';

// $FlowFixMe
import { version } from 'package.json'; // eslint-disable-line
import { COORDINATES_FORMATS } from 'config/constants';
import { syncAreas } from 'redux-modules/areas';
import { getLanguage } from 'helpers/language';
import { syncCountries } from 'redux-modules/countries';
import { syncUser, LOGOUT_REQUEST } from 'redux-modules/user';
import { syncLayers } from 'redux-modules/layers';
import { syncReports } from 'redux-modules/reports';
import { syncTeams } from 'redux-modules/teams';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

import { RETRY_SYNC } from 'redux-modules/shared';
import { CURRENT_REDUX_STATE_VERSION } from '../migrate';
import { NativeModules, Platform } from 'react-native';
import { checkVersion } from 'react-native-check-version';

// Actions
const SET_OFFLINE_MODE = 'app/SET_OFFLINE_MODE';
const SET_APP_SYNCED = 'app/SET_APP_SYNCED';
const SET_APP_SYNCING = 'app/SET_APP_SYNCING';
const DECREASE_APP_SYNCING = 'app/DECREASE_APP_SYNCING';
const SET_AREA_COUNTRY_TOOLTIP_SEEN = 'app/SET_AREA_COUNTRY_TOOLTIP_SEEN';
const SET_AREA_DOWNLOAD_TOOLTIP_SEEN = 'app/SET_AREA_DOWNLOAD_TOOLTIP_SEEN';
const SET_COORDINATES_FORMAT = 'app/SET_COORDINATES_FORMAT';
const SET_MAP_WALKTHROUGH_SEEN = 'app/SET_MAP_WALKTHROUGH_SEEN';
export const SET_HAS_MIGRATED_V1_FILES = 'app/SET_HAS_MIGRATED_V1_FILES';
const SET_PRISTINE_CACHE_TOOLTIP = 'app/SET_PRISTINE_CACHE_TOOLTIP';
const SET_WELCOME_SEEN = 'app/SET_WELCOME_SEEN';
export const SHOW_OFFLINE_MODE_IS_ON = 'app/SHOW_OFFLINE_MODE_IS_ON';
export const SHOW_CONNECTION_REQUIRED = 'app/SHOW_CONNECTION_REQUIRED';
export const UPDATE_APP = 'app/UPDATE_APP';
export const EXPORT_REPORTS_SUCCESSFUL = 'app/EXPORT_REPORTS_SUCCESSFUL';
export const SHARING_BUNDLE_IMPORTED = 'app/SHARING_BUNDLE_IMPORT_SUCCESSFUL';
const SET_NEEDS_APP_UPDATE = 'app/SET_NEEDS_APP_UPDATE';

// Reducer
const initialState = {
  version,
  reduxVersion: CURRENT_REDUX_STATE_VERSION,
  isUpdate: false,
  areaCountryTooltipSeen: false,
  areaDownloadTooltipSeen: false,
  mapWalkthroughSeen: false,
  synced: false,
  syncing: 0,
  language: getLanguage(),
  offlineMode: false,
  pristineCacheTooltip: true,
  coordinatesFormat: COORDINATES_FORMATS.decimal.value,
  hasSeenWelcomeScreen: false,
  welcomeSeenVersion: null,
  hasMigratedV1Files: true, // This will only be set to false in migrate.js if we migrate from v1
  needsAppUpdate: {
    shouldUpdate: false,
    url: '',
    lastUpdate: null
  }
};

export default function reducer(state: AppState = initialState, action: AppAction) {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      // $FlowFixMe
      const { app } = action.payload;
      const language = getLanguage();
      return {
        ...state,
        ...app,
        language,
        version,
        isUpdate: app?.version && app.version !== version,
        needsAppUpdate: {
          ...app?.needsAppUpdate,
          shouldUpdate: false
        }
      };
    }
    case SET_OFFLINE_MODE:
      return { ...state, offlineMode: action.payload };
    case SET_APP_SYNCED:
      return { ...state, synced: action.payload };
    case SET_APP_SYNCING:
      return { ...state, syncing: action.payload };
    case DECREASE_APP_SYNCING:
      return { ...state, syncing: state.syncing > 0 ? state.syncing - 1 : 0 };
    case SET_AREA_COUNTRY_TOOLTIP_SEEN:
      return { ...state, areaCountryTooltipSeen: action.payload };
    case SET_AREA_DOWNLOAD_TOOLTIP_SEEN:
      return { ...state, areaDownloadTooltipSeen: action.payload };
    case SET_COORDINATES_FORMAT:
      return { ...state, coordinatesFormat: action.payload };
    case SET_MAP_WALKTHROUGH_SEEN:
      return { ...state, mapWalkthroughSeen: action.payload };
    case SET_PRISTINE_CACHE_TOOLTIP:
      return { ...state, pristineCacheTooltip: action.payload };
    case SET_WELCOME_SEEN:
      return { ...state, hasSeenWelcomeScreen: true, welcomeSeenVersion: action.payload };
    case SET_HAS_MIGRATED_V1_FILES:
      return { ...state, hasMigratedV1Files: true };
    case LOGOUT_REQUEST:
      return {
        ...initialState,
        language: state.language,
        // These should only be shown once per install, not when you re-login
        areaCountryTooltipSeen: state.areaCountryTooltipSeen,
        areaDownloadTooltipSeen: state.areaDownloadTooltipSeen,
        mapWalkthroughSeen: state.mapWalkthroughSeen,
        hasSeenWelcomeScreen: state.hasSeenWelcomeScreen
      };
    case SET_NEEDS_APP_UPDATE:
      return { ...state, needsAppUpdate: action.payload };
    default:
      return state;
  }
}

export function checkAppVersion(): (dispatch: Dispatch, state: GetState) => void {
  return (dispatch: Dispatch, state: GetState) => {
    const lastUpdate = state().app.needsAppUpdate.lastUpdate;
    const lastUpdateDate = lastUpdate ? new Date(lastUpdate) : new Date();
    checkVersion().then(releasedVersion => {
      return dispatch({
        type: SET_NEEDS_APP_UPDATE,
        payload: {
          shouldUpdate: releasedVersion.needsUpdate,
          url: releasedVersion.url,
          lastUpdate: releasedVersion.needsUpdate ? new Date() : lastUpdateDate
        }
      });
    });
  };
}

export function setOfflineMode(offlineMode: boolean): AppAction {
  if (Platform.OS === 'android') {
    NativeModules.FWMapbox.setOfflineModeEnabled(offlineMode);
  }
  return {
    type: SET_OFFLINE_MODE,
    payload: offlineMode
  };
}

export function setAppSynced(open: boolean): AppAction {
  return {
    type: SET_APP_SYNCED,
    payload: open
  };
}

export function decreaseAppSynced(): AppAction {
  return {
    type: DECREASE_APP_SYNCING
  };
}

export function setAppSyncing(syncing: number): AppAction {
  return {
    type: SET_APP_SYNCING,
    payload: syncing
  };
}

export function syncApp(): (dispatch: Dispatch, state: GetState) => void {
  return (dispatch: Dispatch, state: GetState) => {
    const { user } = state();
    dispatch(syncUser());
    if (user.loggedIn) {
      dispatch(syncCountries());
      dispatch(syncReports());
      dispatch(syncAreas());
      dispatch(syncLayers());
      dispatch(syncTeams());
    }
  };
}

export function updateApp(): AppAction {
  return {
    type: UPDATE_APP
  };
}

export function retrySync(): (dispatch: Dispatch) => void {
  return (dispatch: Dispatch) => {
    dispatch({ type: RETRY_SYNC });
    dispatch(syncApp());
  };
}

export function setCoordinatesFormat(format: CoordinatesValue): AppAction {
  return {
    type: SET_COORDINATES_FORMAT,
    payload: format
  };
}

export function setWelcomeScreenSeen(): AppAction {
  return {
    type: SET_WELCOME_SEEN,
    payload: version
  };
}

export function setPristineCacheTooltip(pristine: boolean): AppAction {
  return {
    type: SET_PRISTINE_CACHE_TOOLTIP,
    payload: pristine
  };
}

export function setAreaCountryTooltipSeen(seen: boolean): AppAction {
  return {
    type: SET_AREA_COUNTRY_TOOLTIP_SEEN,
    payload: seen
  };
}

export function setAreaDownloadTooltipSeen(seen: boolean): AppAction {
  return {
    type: SET_AREA_DOWNLOAD_TOOLTIP_SEEN,
    payload: seen
  };
}

export function setMapWalkthroughSeen(seen: boolean): AppAction {
  return {
    type: SET_MAP_WALKTHROUGH_SEEN,
    payload: seen
  };
}

export function showNotConnectedNotification(): Thunk<void> {
  return (dispatch: Dispatch, getState: GetState) => {
    const { offlineMode } = getState().app;
    if (offlineMode) {
      dispatch({ type: SHOW_OFFLINE_MODE_IS_ON });
      return;
    }
    dispatch({ type: SHOW_CONNECTION_REQUIRED });
  };
}

export function showExportReportsSuccessfulNotification(): AppAction {
  return { type: EXPORT_REPORTS_SUCCESSFUL };
}
