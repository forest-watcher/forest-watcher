import { getFeedbackQuestions } from 'redux-modules/feedback';
import { getReportQuestions } from 'redux-modules/reports';
import { getAreas } from 'redux-modules/areas';
import { getCountries } from 'redux-modules/countries';
import { getUser } from 'redux-modules/user';

// Actions
const SET_LANGUAGE = 'app/SET_LANGUAGE';
export const NET_INFO_CHANGED = 'app/NET_INFO_CHANGED';

// Reducer
const initialState = {
  netInfo: null,
  language: null,
  setupComplete: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_LANGUAGE:
      return Object.assign({}, state, { language: action.payload });
    case NET_INFO_CHANGED:
      return Object.assign({}, state, { netInfo: action.payload });
    default:
      return state;
  }
}

// Action Creators
export function setLanguage(language) {
  return (dispatch) => {
    dispatch({
      type: SET_LANGUAGE,
      payload: language
    });
  };
}

export function syncApp() {
  return (dispatch, state) => {
    const { reports, feedback, areas, user, countries } = state();
    if (!user.synced) dispatch(getUser());
    if (!reports.synced) dispatch(getReportQuestions());
    if (!feedback.dailySynced) dispatch(getFeedbackQuestions('daily'));
    if (!feedback.weeklySynced) dispatch(getFeedbackQuestions('weekly'));
    if (!areas.synced) dispatch(getAreas());
    if (!countries.synced) dispatch(getCountries());
  };
}
