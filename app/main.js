import codePush from 'react-native-code-push';
import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';
import Theme from 'config/theme';
import { registerScreens } from 'screens';
import createStore from 'store';
import { setupCrashLogging } from './crashes';

// Disable ios warnings
// console.disableYellowBox = true;

// Show request in chrome network tool
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

function setCodePush() {
  const codepushEnable = !__DEV__;
  if (codepushEnable) {
    const codePushOptions = {
      checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
      installMode: codePush.InstallMode.ON_NEXT_RESUME
    };
    codePush.sync(codePushOptions);
  }
}

const app = async () => {
  if (!__DEV__) {
    await setupCrashLogging();
  }

  const store = createStore(startApp);
  registerScreens(store, Provider);

  async function startApp() {

    const state = store.getState();
    let screen = 'ForestWatcher.Home';
    if (state.user.loggedIn && state.app.synced) {
      screen = 'ForestWatcher.Dashboard';
    }

    await Navigation.setDefaultOptions({
      ...Theme.navigator.styles
    });

    await Navigation.setRoot({
      root: {
        sideMenu: {
          center: {
            stack: {
              children: [{
                component: {
                  name: screen
                }
              }],
              options: {
                ...Theme.navigator.style
              }
            }
          },
          right: {
            component: {
              name: 'ForestWatcher.RightDrawer',
              passProps: {}
            }
          }
        }
      }
    });
    //setCodePush();
    createStore.runSagas();
  }
};

export default app;
