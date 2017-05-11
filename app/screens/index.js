import { Navigation } from 'react-native-navigation';

import Home from 'containers/home';
import Login from 'containers/login';
import Setup from 'containers/setup';
import Dashboard from 'containers/dashboard';
import Alerts from 'containers/alerts';
import Map from 'containers/map';
import Settings from 'containers/settings';
import Reports from 'containers/reports';
import NewReport from 'containers/reports/new';
import Feedback from 'components/feedback';
import AreaDetail from 'containers/settings/area-detail';
import Partners from 'components/settings/partners';

export function registerScreens(store, Provider) {
  Navigation.registerComponent('ForestWatcher.Home', () => Home, store, Provider);
  Navigation.registerComponent('ForestWatcher.Login', () => Login, store, Provider);
  Navigation.registerComponent('ForestWatcher.Setup', () => Setup, store, Provider);
  Navigation.registerComponent('ForestWatcher.Dashboard', () => Dashboard, store, Provider);
  Navigation.registerComponent('ForestWatcher.Alerts', () => Alerts, store, Provider);
  Navigation.registerComponent('ForestWatcher.Map', () => Map, store, Provider);
  Navigation.registerComponent('ForestWatcher.Settings', () => Settings, store, Provider);
  Navigation.registerComponent('ForestWatcher.Reports', () => Reports, store, Provider);
  Navigation.registerComponent('ForestWatcher.NewReport', () => NewReport, store, Provider);
  Navigation.registerComponent('ForestWatcher.Feedback', () => Feedback, store, Provider);
  Navigation.registerComponent('ForestWatcher.AreaDetail', () => AreaDetail, store, Provider);
  Navigation.registerComponent('ForestWatcher.Partners', () => Partners, store, Provider);
}
