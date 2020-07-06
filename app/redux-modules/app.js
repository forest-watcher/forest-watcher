// @flow
import type { Dispatch, GetState, Thunk } from 'types/store.types';
import type { AppState, AppAction, CoordinatesValue } from 'types/app.types';

// $FlowFixMe
import { version } from 'package.json'; // eslint-disable-line
import { COORDINATES_FORMATS } from 'config/constants/index';
import { syncAreas } from 'redux-modules/areas';
import { getLanguage } from 'helpers/language';
import { syncCountries } from 'redux-modules/countries';
import { syncUser, LOGOUT_REQUEST } from 'redux-modules/user';
import { syncLayers } from 'redux-modules/layers';
import { syncReports } from 'redux-modules/reports';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

import { RETRY_SYNC } from 'redux-modules/shared';
import { NativeModules, Platform } from 'react-native';

// Actions
const SET_OFFLINE_MODE = 'app/SET_OFFLINE_MODE';
const SET_APP_SYNCED = 'app/SET_APP_SYNCED';
const SET_AREA_COUNTRY_TOOLTIP_SEEN = 'app/SET_AREA_COUNTRY_TOOLTIP_SEEN';
const SET_AREA_DOWNLOAD_TOOLTIP_SEEN = 'app/SET_AREA_DOWNLOAD_TOOLTIP_SEEN';
const SET_COORDINATES_FORMAT = 'app/SET_COORDINATES_FORMAT';
const SET_MAP_WALKTHROUGH_SEEN = 'app/SET_MAP_WALKTHROUGH_SEEN';
const SET_PRISTINE_CACHE_TOOLTIP = 'app/SET_PRISTINE_CACHE_TOOLTIP';
const SET_WELCOME_SEEN = 'app/SET_WELCOME_SEEN';
export const SHOW_OFFLINE_MODE_IS_ON = 'app/SHOW_OFFLINE_MODE_IS_ON';
export const SHOW_CONNECTION_REQUIRED = 'app/SHOW_CONNECTION_REQUIRED';
export const UPDATE_APP = 'app/UPDATE_APP';
export const EXPORT_REPORTS_SUCCESSFUL = 'app/EXPORT_REPORTS_SUCCESSFUL';
export const SHARING_BUNDLE_IMPORTED = 'app/SHARING_BUNDLE_IMPORT_SUCCESSFUL';

// Reducer
const initialState = {
  version,
  isUpdate: false,
  areaCountryTooltipSeen: false,
  areaDownloadTooltipSeen: false,
  mapWalkthroughSeen: false,
  synced: false,
  language: getLanguage(),
  offlineMode: false,
  pristineCacheTooltip: true,
  coordinatesFormat: COORDINATES_FORMATS.decimal.value,
  hasSeenWelcomeScreen: false
};

export default function reducer(state: AppState = initialState, action: AppAction) {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      // $FlowFixMe
      const { app } = action.payload;
      const language = getLanguage();
      const isUpdate = app?.version !== undefined && app?.version !== null && app?.version !== version;
      return { ...state, ...app, language, version, isUpdate };
    }
    case SET_OFFLINE_MODE:
      return { ...state, offlineMode: action.payload };
    case SET_APP_SYNCED:
      return { ...state, synced: action.payload };
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
      return { ...state, hasSeenWelcomeScreen: action.payload };
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
    default:
      return state;
  }
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

export function syncApp() {
  return (dispatch: Dispatch, state: GetState) => {
    const { user } = state();
    dispatch(syncUser());
    if (user.loggedIn) {
      dispatch(syncCountries());
      dispatch(syncReports());
      dispatch(syncAreas());
      dispatch(syncLayers());
    }
  };
}

export function updateApp(): AppAction {
  return {
    type: UPDATE_APP
  };
}

export function retrySync() {
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

export function setWelcomeScreenSeen(seen: boolean): AppAction {
  return {
    type: SET_WELCOME_SEEN,
    payload: seen
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
