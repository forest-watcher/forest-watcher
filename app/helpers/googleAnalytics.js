import analytics from '@react-native-firebase/analytics';

// Hardcoded event names
const PREDEFINED_EVENT_LEVEL_START = 'level_start';
const PREDEFINED_EVENT_LEVEL_END = 'level_end';

// Hardcoded parameter names
const PREDEFINED_PARAM_SUCCESS = 'success';
const PREDEFINED_PARAM_LEVEL_NAME = 'level_name';

// Hardcoded parameter values
const AREA_DOWNLOAD_LEVEL_NAME = 'area_download';

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
  }
};
