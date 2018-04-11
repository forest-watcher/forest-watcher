// @flow
import type { Dispatch, GetState } from 'types/store.types';
import type { AppState, AppAction, CoordinatesValue } from 'types/app.types';

// $FlowFixMe
import { version } from 'package.json'; // eslint-disable-line
import { COORDINATES_FORMATS, ACTIONS_SAVED_TO_REPORT } from 'config/constants/index';
import { syncAreas, UPDATE_AREA_REQUEST, SAVE_AREA_REQUEST } from 'redux-modules/areas';
import { syncCountries } from 'redux-modules/countries';
import { syncUser, LOGOUT_REQUEST } from 'redux-modules/user';
import { syncGeostore } from 'redux-modules/geostore';
import { syncLayers } from 'redux-modules/layers';
import { syncReports } from 'redux-modules/reports';
import { syncAlerts } from 'redux-modules/alerts';
import takeRight from 'lodash/takeRight';

// Actions
export const START_APP = 'app/START_APP';
export const SET_LANGUAGE = 'app/SET_LANGUAGE';
const SET_SYNC_MODAL = 'app/SET_SYNC_MODAL';
const SET_SYNC_SKIP = 'app/SET_SYNC_SKIP';
export const RETRY_SYNC = 'app/RETRY_SYNC';
const SET_COORDINATES_FORMAT = 'app/SET_COORDINATES_FORMAT';
const SET_LAYERS_DRAWER_SECTIONS = 'app/SET_LAYERS_DRAWER_SECTIONS';
const SET_PRISTINE_CACHE_TOOLTIP = 'app/SET_PRISTINE_CACHE_TOOLTIP';
export const SAVE_LAST_ACTIONS = 'app/SAVE_LAST_ACTIONS';

// Reducer
const initialState = {
  language: null,
  syncModalOpen: false,
  syncSkip: false,
  coordinatesFormat: COORDINATES_FORMATS.decimal.value,
  showLegend: true,
  pristineCacheTooltip: true,
  actions: [],
  version // app cache invalidation depends on this, if this changes make sure that redux-persist invalidation changes also.
};

export default function reducer(state: AppState = initialState, action: AppAction) {
  switch (action.type) {
    case SET_LANGUAGE:
      return { ...state, language: action.payload };
    case SET_SYNC_MODAL:
      return { ...state, syncModalOpen: action.payload };
    case START_APP:
      return { ...state, syncSkip: false, syncModalOpen: false };
    case SET_SYNC_SKIP:
      return { ...state, syncSkip: action.payload };
    case UPDATE_AREA_REQUEST:
      return { ...state, syncSkip: false };
    case SAVE_AREA_REQUEST:
      return { ...state, syncSkip: false };
    case SET_COORDINATES_FORMAT:
      return { ...state, coordinatesFormat: action.payload };
    case SET_LAYERS_DRAWER_SECTIONS:
      return { ...state, showLegend: action.payload };
    case SET_PRISTINE_CACHE_TOOLTIP:
      return { ...state, pristineCacheTooltip: action.payload };
    case SAVE_LAST_ACTIONS: {
      // Save the last actions to send to the report
      const actions = [...takeRight(state.actions, ACTIONS_SAVED_TO_REPORT), action.payload];
      return { ...state, actions };
    }
    case LOGOUT_REQUEST:
      return initialState;
    default:
      return state;
  }
}

// Action Creators
export function setLanguage(language: string): AppAction {
  return {
    type: SET_LANGUAGE,
    payload: language
  };
}
export function setSyncModal(open: boolean): AppAction {
  return {
    type: SET_SYNC_MODAL,
    payload: open
  };
}
export function setSyncSkip(status: boolean): AppAction {
  return {
    type: SET_SYNC_SKIP,
    payload: status
  };
}
export function startApp(): AppAction {
  return {
    type: START_APP
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
      dispatch(syncGeostore());
      dispatch(syncAlerts());
      dispatch(syncLayers());
    }
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

export function setPristineCacheTooltip(pristine: boolean): AppAction {
  return {
    type: SET_PRISTINE_CACHE_TOOLTIP,
    payload: pristine
  };
}
