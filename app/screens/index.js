import React from 'react';
import { Navigation } from 'react-native-navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Areas from 'containers/areas';
import CustomComponents from 'components/settings/custom-components';
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
import Routes from 'containers/routes';
import MapWalkthrough from 'components/map/walkthrough';
import NewReport from 'containers/form/form';
import AreaDetail from 'containers/areas/area-detail';
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

function registerComponent(name, Screen, Provider, store) {
  Navigation.registerComponent(
    name,
    () => props => (
      <Provider store={store}>
        <SafeAreaProvider>
          <Screen {...props} />
        </SafeAreaProvider>
      </Provider>
    ),
    () => Screen
  );
}

export function registerScreens(store, Provider) {
  registerComponent('ForestWatcher.Areas', Areas, Provider, store);
  registerComponent('ForestWatcher.CustomComponents', CustomComponents, Provider, store);
  registerComponent('ForestWatcher.Home', Home, Provider, store);
  registerComponent('ForestWatcher.Login', Login, Provider, store);
  registerComponent('ForestWatcher.SetupBoundaries', SetupBoundaries, Provider, store);
  registerComponent('ForestWatcher.SetupCountry', SetupCountry, Provider, store);
  registerComponent('ForestWatcher.SetupOverview', SetupOverview, Provider, store);
  registerComponent('ForestWatcher.Dashboard', Dashboard, Provider, store);
  registerComponent('ForestWatcher.Map', Map, Provider, store);
  registerComponent('ForestWatcher.MapWalkthrough', MapWalkthrough, Provider, store);
  registerComponent('ForestWatcher.Settings', Settings, Provider, store);
  registerComponent('ForestWatcher.ContactUs', ContactUs, Provider, store);
  registerComponent('ForestWatcher.Reports', Reports, Provider, store);
  registerComponent('ForestWatcher.NewReport', NewReport, Provider, store);
  registerComponent('ForestWatcher.AreaDetail', AreaDetail, Provider, store);
  registerComponent('ForestWatcher.Partners', Partners, Provider, store);
  registerComponent('ForestWatcher.TermsAndConditions', TermsAndConditions, Provider, store);
  registerComponent('ForestWatcher.FaqList', FaqList, Provider, store);
  registerComponent('ForestWatcher.FaqDetail', FaqDetail, Provider, store);
  registerComponent('ForestWatcher.Sync', Sync, Provider, store);
  registerComponent('ForestWatcher.Answers', Answers, Provider, store);
  registerComponent('ForestWatcher.RightDrawer', RightDrawer, Provider, store);
  registerComponent('ForestWatcher.ErrorLightbox', ErrorLightbox, Provider, store);
  registerComponent('ForestWatcher.ToastNotification', ToastNotification, Provider, store);
  registerComponent('ForestWatcher.Routes', Routes, Provider, store);
  registerComponent('ForestWatcher.RouteDetail', RouteDetail, Provider, store);
  registerComponent('ForestWatcher.SaveRoute', SaveRoute, Provider, store);
}

export default registerScreens;
