import { Navigation } from 'react-native-navigation';

import Home from 'containers/home';
import Login from 'containers/login';
import Setup from 'containers/setup';
import Dashboard from 'containers/dashboard';
import Map from 'containers/map';
import Settings from 'containers/settings';
import ContactUs from 'components/settings/contact-us';
import Reports from 'containers/reports';
import NewReport from 'containers/reports/form';
import AreaDetail from 'containers/settings/area-detail';
import Partners from 'components/settings/partners';
import TermsAndConditions from 'components/settings/terms-and-conditions';
import TermsAndConditionsDetail from 'components/settings/terms-and-conditions/detail';
import FaqList from 'components/settings/faq';
import FaqDetail from 'components/settings/faq/detail';
import Sync from 'containers/sync';
import Answers from 'containers/common/form/answers';
import RightDrawer from 'components/right-drawer';
import ErrorLightbox from 'components/error-lightbox';
import Walkthrough from 'components/walkthrough';
import ToastNotification from 'components/toast-notification';

export function registerScreens(store, Provider) {
  Navigation.registerComponent('ForestWatcher.Home', () => Home, store, Provider);
  Navigation.registerComponent('ForestWatcher.Login', () => Login, store, Provider);
  Navigation.registerComponent('ForestWatcher.Walkthrough', () => Walkthrough, store, Provider);
  Navigation.registerComponent('ForestWatcher.Setup', () => Setup, store, Provider);
  Navigation.registerComponent('ForestWatcher.Dashboard', () => Dashboard, store, Provider);
  Navigation.registerComponent('ForestWatcher.Map', () => Map, store, Provider);
  Navigation.registerComponent('ForestWatcher.Settings', () => Settings, store, Provider);
  Navigation.registerComponent('ForestWatcher.ContactUs', () => ContactUs, store, Provider);
  Navigation.registerComponent('ForestWatcher.Reports', () => Reports, store, Provider);
  Navigation.registerComponent('ForestWatcher.NewReport', () => NewReport, store, Provider);
  Navigation.registerComponent('ForestWatcher.AreaDetail', () => AreaDetail, store, Provider);
  Navigation.registerComponent('ForestWatcher.Partners', () => Partners, store, Provider);
  Navigation.registerComponent('ForestWatcher.TermsAndConditions', () => TermsAndConditions, store, Provider);
  Navigation.registerComponent('ForestWatcher.FaqList', () => FaqList, store, Provider);
  Navigation.registerComponent('ForestWatcher.FaqDetail', () => FaqDetail, store, Provider);
  Navigation.registerComponent('ForestWatcher.TermsAndConditionsDetail', () => TermsAndConditionsDetail, store, Provider);
  Navigation.registerComponent('ForestWatcher.Sync', () => Sync, store, Provider);
  Navigation.registerComponent('ForestWatcher.Answers', () => Answers, store, Provider);
  Navigation.registerComponent('ForestWatcher.RightDrawer', () => RightDrawer, store, Provider);
  Navigation.registerComponent('ForestWatcher.ErrorLightbox', () => ErrorLightbox, store, Provider);
  Navigation.registerComponent('ForestWatcher.ToastNotification', () => ToastNotification, store, Provider);
}

export default registerScreens;
