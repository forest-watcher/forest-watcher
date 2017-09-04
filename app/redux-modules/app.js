import { version } from 'package.json';
import { COORDINATES_FORMATS } from 'config/constants/index';
import { syncAreas, UPDATE_AREA_REQUEST, SAVE_AREA_REQUEST } from 'redux-modules/areas';
import { syncCountries } from 'redux-modules/countries';
import { syncUser, LOGOUT_REQUEST } from 'redux-modules/user';
import { syncGeostore } from 'redux-modules/geostore';
import { syncLayers } from 'redux-modules/layers';
import { syncReports } from 'redux-modules/reports';
import { syncAlerts } from 'redux-modules/alerts';

// Actions
export const START_APP = 'app/START_APP';
const SET_LANGUAGE = 'app/SET_LANGUAGE';
const SET_SYNC_MODAL = 'app/SET_SYNC_MODAL';
const SET_SYNC_SKIP = 'app/SET_SYNC_SKIP';
export const RETRY_SYNC = 'app/RETRY_SYNC';
const SET_COORDINATES_FORMAT = 'app/SET_COORDINATES_FORMAT';
const SET_LAYERS_DRAWER_SECTIONS = 'app/SET_LAYERS_DRAWER_SECTIONS';
const SET_PRISTINE = 'app/SET_PRISTINE';

// Reducer
const initialState = {
  language: null,
  syncModalOpen: false,
  syncSkip: false,
  coordinatesFormat: COORDINATES_FORMATS.decimal.value,
  showLegend: true,
  pristine: true,
  version // app cache invalidation depends on this, if this changes make sure that redux-persist invalidation changes also.
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_LANGUAGE:
      return Object.assign({}, state, { language: action.payload });
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
    case SET_PRISTINE:
      return { ...state, pristine: action.payload };
    case LOGOUT_REQUEST:
      return initialState;
    default:
      return state;
  }
}

// Action Creators
export function setLanguage(language) {
  return {
    type: SET_LANGUAGE,
    payload: language
  };
}
export function setSyncModal(open) {
  return {
    type: SET_SYNC_MODAL,
    payload: open
  };
}
export function setSyncSkip(status) {
  return {
    type: SET_SYNC_SKIP,
    payload: status
  };
}
export function startApp() {
  return {
    type: START_APP
  };
}

export function syncApp() {
  return (dispatch, state) => {
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
  return (dispatch) => {
    dispatch({ type: RETRY_SYNC });
    dispatch(syncApp());
  };
}

export function setCoordinatesFormat(format) {
  return {
    type: SET_COORDINATES_FORMAT,
    payload: format
  };
}

export function setShowLegend(hasAlerts) {
  return {
    type: SET_LAYERS_DRAWER_SECTIONS,
    payload: hasAlerts
  };
}

export function pristineCacheTooltip(pristine) {
  return {
    type: SET_PRISTINE,
    payload: pristine
  };
}
