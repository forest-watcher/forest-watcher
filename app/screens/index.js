import React from 'react';
import { Navigation } from 'react-native-navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Areas from 'containers/areas';
import MappingFiles from 'containers/settings/mapping-files';
import ImportLayerRename from 'containers/settings/contextual-layers/import-layer-rename';
import ImportLayerType from 'components/settings/contextual-layers/import-layer-type';
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
import MapWalkthrough from 'containers/map/walkthrough';
import NewReport from 'containers/form/form';
import AreaDetail from 'containers/areas/area-detail';
import Partners from 'components/settings/partners';
import TermsAndConditions from 'components/settings/terms-and-conditions';
import FaqCategories from 'components/faq';
import FaqCategory from 'components/faq/category';
import FaqDetail from 'components/faq/detail';
import Sync from 'containers/sync';
import Answers from 'containers/form/answers';
import ErrorLightbox from 'components/error-lightbox';
import ToastNotification from 'components/toast-notification';
import RouteDetail from '../containers/routes/route-detail';
import SaveRoute from '../containers/routes/save-route';
import Welcome from '../containers/welcome';
import MapSidebar from 'containers/map-sidebar';
import ReportLayerSettings from 'containers/settings/layer-settings/reports';
import AlertLayerSettings from 'containers/settings/layer-settings/alerts';
import RoutesLayerSettings from 'containers/settings/layer-settings/routes';
import ContextualLayersLayerSettings from 'containers/settings/layer-settings/contextual-layers';
import BasemapLayerSettings from 'containers/settings/layer-settings/basemap';
import ImportLayerError from 'components/settings/contextual-layers/import-layer-error';

/**
 * Registers a component with React Native Navigation
 *
 * @param {string} name The name of the screen
 * @param {Object} Screen The component to register
 * @param {Object} Provider A provider component to wrap the screen in
 * @param {Object} store The redux store to give to the provider
 * @param {boolean} wrapInSafeAreaProvider Allows you to disable wrapping in safe area provider. This is useful as for example wrapping in safe area provider breaks RNN overlay's `interceptTouchOutside`
 */
function registerComponent(name, Screen, Provider, store, wrapInSafeAreaProvider = true) {
  const Wrapper = wrapInSafeAreaProvider ? SafeAreaProvider : React.Fragment;
  Navigation.registerComponent(
    name,
    () => props => (
      <Provider store={store}>
        <Wrapper>
          <Screen {...props} />
        </Wrapper>
      </Provider>
    ),
    () => Screen
  );
}

export function registerScreens(store, Provider) {
  registerComponent('ForestWatcher.Areas', Areas, Provider, store);
  registerComponent('ForestWatcher.MappingFiles', MappingFiles, Provider, store);
  registerComponent('ForestWatcher.Home', Home, Provider, store);
  registerComponent('ForestWatcher.ImportLayerRename', ImportLayerRename, Provider, store);
  registerComponent('ForestWatcher.ImportLayerType', ImportLayerType, Provider, store);
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
  registerComponent('ForestWatcher.FaqCategories', FaqCategories, Provider, store);
  registerComponent('ForestWatcher.FaqCategory', FaqCategory, Provider, store);
  registerComponent('ForestWatcher.FaqDetail', FaqDetail, Provider, store);
  registerComponent('ForestWatcher.Sync', Sync, Provider, store);
  registerComponent('ForestWatcher.Answers', Answers, Provider, store);
  registerComponent('ForestWatcher.MapLayersDrawer', MapSidebar, Provider, store);
  registerComponent('ForestWatcher.ErrorLightbox', ErrorLightbox, Provider, store);
  registerComponent('ForestWatcher.ToastNotification', ToastNotification, Provider, store, false);
  registerComponent('ForestWatcher.Routes', Routes, Provider, store);
  registerComponent('ForestWatcher.RouteDetail', RouteDetail, Provider, store);
  registerComponent('ForestWatcher.SaveRoute', SaveRoute, Provider, store);
  registerComponent('ForestWatcher.Welcome', Welcome, Provider, store);
  registerComponent('ForestWatcher.AlertLayerSettings', AlertLayerSettings, Provider, store);
  registerComponent('ForestWatcher.RoutesLayerSettings', RoutesLayerSettings, Provider, store);
  registerComponent('ForestWatcher.ReportsLayerSettings', ReportLayerSettings, Provider, store);
  registerComponent('ForestWatcher.ContextualLayersLayerSettings', ContextualLayersLayerSettings, Provider, store);
  registerComponent('ForestWatcher.BasemapLayerSettings', BasemapLayerSettings, Provider, store);
  registerComponent('ForestWatcher.ImportLayerError', ImportLayerError, Provider, store);
}

export default registerScreens;
