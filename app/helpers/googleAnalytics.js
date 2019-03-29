import firebase from 'react-native-firebase';

// Hardcoded event names
const PREDEFINED_EVENT_LEVEL_START = 'level_start';
const PREDEFINED_EVENT_LEVEL_END = 'level_end';
const EVENT_LAYER_TOGGLED = 'layer_toggled';

// Hardcoded parameter names
const PREDEFINED_PARAM_SUCCESS = 'success';
const PREDEFINED_PARAM_LEVEL_NAME = 'level_name';
const PARAM_LAYER_NAME = 'layer_name';
const PARAM_LAYER_ENABLED = 'layer_enabled';
const PARAM_REPORT_NUM_ALERTS = 'report_alerts';
const PARAM_REPORT_OUTCOME = 'report_outcome';

// Hardcoded parameter values
const REPORT_LEVEL_NAME = 'report';
export const REPORT_OUTCOME_CANCELLED = 'cancelled';
export const REPORT_OUTCOME_SAVED = 'saved';
export const REPORT_OUTCOME_COMPLETED = 'completed';

export default {
  trackLayerToggledEvent: (layerName, isEnabled) => {
    firebase.analytics().logEvent(EVENT_LAYER_TOGGLED, {
      [PARAM_LAYER_NAME]: layerName,
      [PARAM_LAYER_ENABLED]: isEnabled ? 1 : 0
    });
  },
  trackReportFlowStartedEvent: numAlertsInReport => {
    firebase.analytics().logEvent(PREDEFINED_EVENT_LEVEL_START, {
      [PREDEFINED_PARAM_LEVEL_NAME]: REPORT_LEVEL_NAME,
      [PARAM_REPORT_NUM_ALERTS]: numAlertsInReport
    });
  },
  trackReportFlowEndedEvent: reportOutcome => {
    firebase.analytics().logEvent(PREDEFINED_EVENT_LEVEL_END, {
      [PREDEFINED_PARAM_LEVEL_NAME]: REPORT_LEVEL_NAME,
      [PREDEFINED_PARAM_SUCCESS]: reportOutcome !== REPORT_OUTCOME_CANCELLED,
      [PARAM_REPORT_OUTCOME]: reportOutcome
    });
  },
  trackScreenView: screenName => {
    firebase.analytics().setCurrentScreen(screenName, screenName);
  }
};
