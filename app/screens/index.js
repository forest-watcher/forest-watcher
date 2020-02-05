import { Navigation } from 'react-native-navigation';

import Home from 'containers/home';
import Login from 'containers/login';
import SetupBoundaries from 'containers/setup/boundaries';
import SetupCountry from 'containers/setup/country';
import SetupOverview from 'containers/setup/overview';
import Dashboard from 'containers/dashboard';
import Map from 'containers/map';
import Settings from 'containers/settings';
import ContactUs from 'components/settings/contact-us';
import Reports from 'containers/reports';
import NewReport from 'containers/form/form';
import AreaDetail from 'containers/settings/area-detail';
import Partners from 'components/settings/partners';
import TermsAndConditions from 'components/settings/terms-and-conditions';
import FaqList from 'components/settings/faq';
import FaqDetail from 'components/settings/faq/detail';
import Sync from 'containers/sync';
import Answers from 'containers/form/answers';
import RightDrawer from 'components/right-drawer';
import ErrorLightbox from 'components/error-lightbox';
import ToastNotification from 'components/toast-notification';
import RouteDetail from '../containers/routes/route-detail';
import SaveRoute from '../containers/routes/save-route';

export function registerScreens(store, Provider) {
  Navigation.registerComponentWithRedux('ForestWatcher.Home', () => Home, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.Login', () => Login, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.SetupBoundaries', () => SetupBoundaries, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.SetupCountry', () => SetupCountry, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.SetupOverview', () => SetupOverview, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.Dashboard', () => Dashboard, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.Map', () => Map, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.Settings', () => Settings, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.ContactUs', () => ContactUs, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.Reports', () => Reports, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.NewReport', () => NewReport, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.AreaDetail', () => AreaDetail, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.Partners', () => Partners, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.TermsAndConditions', () => TermsAndConditions, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.FaqList', () => FaqList, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.FaqDetail', () => FaqDetail, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.Sync', () => Sync, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.Answers', () => Answers, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.RightDrawer', () => RightDrawer, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.ErrorLightbox', () => ErrorLightbox, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.ToastNotification', () => ToastNotification, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.RouteDetail', () => RouteDetail, Provider, store);
  Navigation.registerComponentWithRedux('ForestWatcher.SaveRoute', () => SaveRoute, Provider, store);
}

export default registerScreens;
