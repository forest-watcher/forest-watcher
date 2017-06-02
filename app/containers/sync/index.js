import { connect } from 'react-redux';
import { getAreas } from 'redux-modules/areas';
import { getQuestions as getFeedbackQuestions } from 'redux-modules/feedback';
import { getQuestions as getReportQuestions } from 'redux-modules/reports';
import { getCountries } from 'redux-modules/countries';
import { getLanguage } from 'helpers/language';

import Sync from 'components/sync';

const getForms = (hasForms, languageChanged) => {
  if (hasForms.report || languageChanged) getReportQuestions();
  if (hasForms.daily || languageChanged) getFeedbackQuestions('daily');
  if (hasForms.weekly || languageChanged) getFeedbackQuestions('weekly');
};

function mapStateToProps(state) {
  return {
    online: state.offline.online,
    reach: state.app.reach,
    languageChanged: state.app.language !== getLanguage(),
    hasForms: {
      report: Object.keys(state.reports.forms).length > 0,
      daily: Object.keys(state.feedback.daily).length > 0,
      weekly: Object.keys(state.feedback.weekly).length > 0
    }
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getAreas: () => {
      dispatch(getAreas());
    },
    getCountries: () => {
      dispatch(getCountries());
    }
  };
}

function mergeProps({ hasForms, languageChanged, ...stateProps }, dispatchProps, ownProps) {
  return {
    ...ownProps,
    ...dispatchProps,
    ...stateProps,
    getForms: () => getForms(hasForms, languageChanged)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Sync);
