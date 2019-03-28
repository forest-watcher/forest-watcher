import firebase from 'react-native-firebase';

export default {
  trackEvent: () => {},
  trackScreenView: screenName => {
    firebase.analytics().setCurrentScreen(screenName, screenName);
  }
};
