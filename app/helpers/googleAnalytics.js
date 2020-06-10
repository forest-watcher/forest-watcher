import analytics from '@react-native-firebase/analytics';

// Hardcoded event names
const PREDEFINED_EVENT_LEVEL_START = 'level_start';
const PREDEFINED_EVENT_LEVEL_END = 'level_end';

// Hardcoded parameter names
const PREDEFINED_PARAM_SUCCESS = 'success';
const PREDEFINED_PARAM_LEVEL_NAME = 'level_name';
const PARAM_REPORT_NUM_ALERTS = 'report_alerts';
const PARAM_REPORT_OUTCOME = 'report_outcome';

// Hardcoded parameter values
const AREA_DOWNLOAD_LEVEL_NAME = 'area_download';
const REPORT_FLOW_LEVEL_NAME = 'report';
export const REPORT_OUTCOME_CANCELLED = 'cancelled';
export const REPORT_OUTCOME_SAVED = 'saved';
export const REPORT_OUTCOME_COMPLETED = 'completed';

export default {
  trackAreaDownloadStartedEvent: () => {
    analytics().logEvent(PREDEFINED_EVENT_LEVEL_START, {
      [PREDEFINED_PARAM_LEVEL_NAME]: AREA_DOWNLOAD_LEVEL_NAME
    });
  },
  trackAreaDownloadEndedEvent: isSuccess => {
    analytics().logEvent(PREDEFINED_EVENT_LEVEL_END, {
      [PREDEFINED_PARAM_LEVEL_NAME]: AREA_DOWNLOAD_LEVEL_NAME,
      [PREDEFINED_PARAM_SUCCESS]: isSuccess
    });
  },
  trackReportFlowStartedEvent: numAlertsInReport => {
    analytics().logEvent(PREDEFINED_EVENT_LEVEL_START, {
      [PREDEFINED_PARAM_LEVEL_NAME]: REPORT_FLOW_LEVEL_NAME,
      [PARAM_REPORT_NUM_ALERTS]: numAlertsInReport
    });
  },
  trackReportFlowEndedEvent: reportOutcome => {
    analytics().logEvent(PREDEFINED_EVENT_LEVEL_END, {
      [PREDEFINED_PARAM_LEVEL_NAME]: REPORT_FLOW_LEVEL_NAME,
      [PREDEFINED_PARAM_SUCCESS]: reportOutcome !== REPORT_OUTCOME_CANCELLED,
      [PARAM_REPORT_OUTCOME]: reportOutcome
    });
  }
};
