import { getFeedbackQuestions } from 'redux-modules/feedback';
import { getReportQuestions } from 'redux-modules/reports';
import { syncAreas } from 'redux-modules/areas';
import { getCountries } from 'redux-modules/countries';
import { getUser } from 'redux-modules/user';

// Actions
const SET_LANGUAGE = 'app/SET_LANGUAGE';

// Reducer
const initialState = {
  netInfo: null,
  language: null
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_LANGUAGE:
      return Object.assign({}, state, { language: action.payload });
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
    const { reports, feedback, user, countries } = state();
    dispatch(syncAreas()); // syncAreas internally checks if it synced or not
    if (!user.synced && !user.syncing) dispatch(getUser());
    if (!reports.synced && !reports.syncing) dispatch(getReportQuestions());
    if (!feedback.synced.daily && !feedback.syncing.daily) dispatch(getFeedbackQuestions('daily'));
    if (!feedback.synced.weekly && !feedback.syncing.weekly) dispatch(getFeedbackQuestions('weekly'));
    if (!countries.synced && !countries.syncing) dispatch(getCountries());
  };
}
