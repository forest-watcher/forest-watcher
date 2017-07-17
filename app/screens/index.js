import { Navigation } from 'react-native-navigation';

import Home from 'containers/home';
import Login from 'containers/login';
import Setup from 'containers/setup';
import Dashboard from 'containers/dashboard';
import Map from 'containers/map';
import Settings from 'containers/settings';
import Reports from 'containers/reports';
import Feedback from 'containers/feedback';
import NewReport from 'containers/reports/form';
import AreaDetail from 'containers/settings/area-detail';
import Partners from 'components/settings/partners';
import Sync from 'containers/sync';
import Answers from 'containers/common/form/answers';
import RightDrawer from 'components/right-drawer';
import ErrorLightbox from 'components/error-lightbox';

export function registerScreens(store, Provider) {
  Navigation.registerComponent('ForestWatcher.Home', () => Home, store, Provider);
  Navigation.registerComponent('ForestWatcher.Login', () => Login, store, Provider);
  Navigation.registerComponent('ForestWatcher.Setup', () => Setup, store, Provider);
  Navigation.registerComponent('ForestWatcher.Dashboard', () => Dashboard, store, Provider);
  Navigation.registerComponent('ForestWatcher.Map', () => Map, store, Provider);
  Navigation.registerComponent('ForestWatcher.Settings', () => Settings, store, Provider);
  Navigation.registerComponent('ForestWatcher.Reports', () => Reports, store, Provider);
  Navigation.registerComponent('ForestWatcher.NewReport', () => NewReport, store, Provider);
  Navigation.registerComponent('ForestWatcher.Feedback', () => Feedback, store, Provider);
  Navigation.registerComponent('ForestWatcher.AreaDetail', () => AreaDetail, store, Provider);
  Navigation.registerComponent('ForestWatcher.Partners', () => Partners, store, Provider);
  Navigation.registerComponent('ForestWatcher.Sync', () => Sync, store, Provider);
  Navigation.registerComponent('ForestWatcher.Answers', () => Answers, store, Provider);
  Navigation.registerComponent('ForestWatcher.RightDrawer', () => RightDrawer, store, Provider);
  Navigation.registerComponent('ForestWatcher.ErrorLightbox', () => ErrorLightbox, store, Provider);
}

export default registerScreens;
