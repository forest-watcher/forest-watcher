import { connect } from 'react-redux';
import { getAreas } from 'redux-modules/areas';
import { getFeedbackQuestions } from 'redux-modules/feedback';
import { getReportQuestions } from 'redux-modules/reports';
import { getCountries } from 'redux-modules/countries';
import { getLanguage } from 'helpers/language';
import { getReadyState } from 'helpers/sync';
import { getUser } from 'redux-modules/user';

import Sync from 'components/sync';

const getForms = ({ hasForms, languageChanged, getFormsDispatch }) => {
  if (!hasForms.report || languageChanged) getFormsDispatch.report();
  if (!hasForms.daily || languageChanged) getFormsDispatch.daily();
  if (!hasForms.weekly || languageChanged) getFormsDispatch.weekly();
};

function mapStateToProps(state) {
  return {
    isConnected: state.offline.online,
    reach: state.app.netInfo.reach,
    languageChanged: state.app.language !== getLanguage(),
    hasAreas: state.areas.data && state.areas.data.length > 0,
    hasUserData: state.user.data && Object.keys(state.user.data).length > 0,
    hasForms: {
      report: Object.keys(state.reports.forms).length > 0,
      daily: Object.keys(state.feedback.daily).length > 0,
      weekly: Object.keys(state.feedback.weekly).length > 0
    },
    readyState: getReadyState(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getAreasDispatch: () => {
      dispatch(getAreas());
    },
    getUserDispatch: () => {
      dispatch(getUser());
    },
    getCountries: () => {
      dispatch(getCountries());
    },
    getFormsDispatch: {
      report: () => dispatch(getReportQuestions()),
      daily: () => dispatch(getFeedbackQuestions('daily')),
      weekly: () => dispatch(getFeedbackQuestions('weekly'))
    }
  };
}

function mergeProps({ hasUserData, hasAreas, hasForms, languageChanged, ...stateProps },
  { getUserDispatch, getAreasDispatch, getFormsDispatch, ...dispatchProps }, ownProps) {
  return {
    ...ownProps,
    ...dispatchProps,
    ...stateProps,
    getUser: () => (!hasUserData && getUserDispatch()),
    getAreas: () => (!hasAreas && getAreasDispatch()),
    getForms: () => getForms({ hasForms, languageChanged, getFormsDispatch })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Sync);
