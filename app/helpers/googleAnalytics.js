import firebase from 'react-native-firebase';

const PREDEFINED_EVENT_LEVEL_START = 'level_start';
const PREDEFINED_EVENT_LEVEL_END = 'level_end';
const PREDEFINED_PARAM_LEVEL_NAME = 'level_name';
const PREDEFINED_PARAM_SUCCESS = 'success';

const REPORT_PARAM_NUM_ALERTS = 'report_alerts';
const REPORT_PARAM_OUTCOME = 'report_outcome';

const REPORT_LEVEL_NAME = 'report';
export const REPORT_OUTCOME_CANCELLED = 'cancelled';
export const REPORT_OUTCOME_SAVED = 'saved';
export const REPORT_OUTCOME_COMPLETED = 'completed';

export default {
  trackReportFlowStartedEvent: numAlertsInReport => {
    firebase.analytics().logEvent(PREDEFINED_EVENT_LEVEL_START, {
      [PREDEFINED_PARAM_LEVEL_NAME]: REPORT_LEVEL_NAME,
      [REPORT_PARAM_NUM_ALERTS]: numAlertsInReport
    });
  },
  trackReportFlowEndedEvent: reportOutcome => {
    firebase.analytics().logEvent(PREDEFINED_EVENT_LEVEL_END, {
      [PREDEFINED_PARAM_LEVEL_NAME]: REPORT_LEVEL_NAME,
      [PREDEFINED_PARAM_SUCCESS]: reportOutcome !== REPORT_OUTCOME_CANCELLED,
      [REPORT_PARAM_OUTCOME]: reportOutcome
    });
  },
  trackScreenView: screenName => {
    firebase.analytics().setCurrentScreen(screenName, screenName);
  }
};
