import firebase from 'react-native-firebase';

export default {
  trackEvent: (name, params) => {
    firebase.analytics().logEvent(name, params);
  },
  trackScreenView: screenName => {
    firebase.analytics().setCurrentScreen(screenName, screenName);
  }
};
