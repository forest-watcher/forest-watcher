
import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';
import Theme from 'config/theme';
import { registerScreens } from 'screens';
import createStore from './store';


import { setExceptionHandlers, checkPrevCrashes } from './crashes';

// Disable ios warnings
// console.disableYellowBox = true;

// Show request in chrome network tool
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;


const app = () => {
  const store = createStore(startApp);
  createStore.runSagas();
  registerScreens(store, Provider);

  function startApp() {
    const state = store.getState();
    let screen = 'ForestWatcher.Home';
    let navigatorStyle = Theme.navigator.styles;
    let title = '';
    if (state.user.loggedIn && state.app.synced) {
      screen = 'ForestWatcher.Dashboard';
      navigatorStyle = {};
      title = 'Forest Watcher';
    }
    Navigation.startSingleScreenApp({
      screen: {
        title,
        screen,
        navigatorStyle
      },
      drawer: {
        right: {
          screen: 'ForestWatcher.RightDrawer',
          passProps: {}
        },
        disableOpenGesture: true
      },
      appStyle: {
        orientation: 'portrait'
      }
    });
    setExceptionHandlers(store);
    checkPrevCrashes();
  }
};

export default app;
