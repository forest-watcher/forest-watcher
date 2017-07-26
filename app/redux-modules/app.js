import { version } from 'package.json';
import { getFeedbackQuestions } from 'redux-modules/feedback';
import { syncAreas, UPDATE_AREA_REQUEST, SAVE_AREA_REQUEST } from 'redux-modules/areas';
import { getCountries } from 'redux-modules/countries';
import { getUser, LOGOUT_REQUEST } from 'redux-modules/user';
import { syncGeostore } from 'redux-modules/geostore';
import { syncLayers } from 'redux-modules/layers';
import { syncReports } from 'redux-modules/reports';

// Actions
export const START_APP = 'app/START_APP';
const SET_LANGUAGE = 'app/SET_LANGUAGE';
const SET_SYNC_MODAL = 'app/SET_SYNC_MODAL';
const SET_SYNC_SKIP = 'app/SET_SYNC_SKIP';

// Reducer
const initialState = {
  language: null,
  syncModalOpen: false,
  syncSkip: false,
  version // app cache invalidation depends on this, if this changes make sure that redux-persist invalidation changes also.
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_LANGUAGE:
      return Object.assign({}, state, { language: action.payload });
    case SET_SYNC_MODAL:
      return { ...state, syncModalOpen: action.payload };
    case START_APP:
      return { ...state, syncSkip: false };
    case SET_SYNC_SKIP:
      return { ...state, syncSkip: action.payload };
    case UPDATE_AREA_REQUEST:
      return { ...state, syncSkip: false };
    case SAVE_AREA_REQUEST:
      return { ...state, syncSkip: false };
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
    const { feedback, user, countries } = state();
    if (!user.synced && !user.syncing) dispatch(getUser());
    if (!feedback.synced.daily && !feedback.syncing.daily) dispatch(getFeedbackQuestions('daily'));
    if (!feedback.synced.weekly && !feedback.syncing.weekly) dispatch(getFeedbackQuestions('weekly'));
    if (!countries.synced && !countries.syncing) dispatch(getCountries());
    dispatch(syncLayers());
    dispatch(syncReports());
    dispatch(syncGeostore());
    dispatch(syncAreas());
  };
}
