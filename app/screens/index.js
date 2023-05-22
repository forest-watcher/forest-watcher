import React from 'react';
import { Navigation } from 'react-native-navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Areas from 'containers/areas';
import Teams from 'containers/teams';
import TeamDetails from 'containers/teamDetails';
import MappingFiles from 'containers/settings/mapping-files';
import ImportMappingFileRename from 'containers/settings/mapping-files/import/rename';
import ImportMappingFileType from 'components/settings/mapping-files/import/type';
import Home from 'containers/home';
import Login from 'containers/login';
import SetupBoundaries from 'containers/setup/boundaries';
import SetupCountry from 'containers/setup/country';
import SetupOverview from 'containers/setup/overview';
import ShapefileOverview from 'containers/setup/shapefile';
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
import GFWContextualLayers from 'components/settings/gfw-layers';
import GFWContextualLayerDownload from 'containers/settings/gfw-layers/layer-download';
import ImportMappingFileError from 'components/settings/mapping-files/import/error';
import EmailLogin from 'containers/login/email-login';
import ImportSharingBundleStart from 'components/sharing-bundle/import/start';
import ImportSharingBundleCustomItems from 'components/sharing-bundle/import/custom-items';
import ImportSharingBundleCustomLayers from 'components/sharing-bundle/import/custom-layers';
import ImportSharingBundleCustomBasemaps from 'components/sharing-bundle/import/custom-basemaps';
import ImportSharingBundleConfirm from 'containers/sharing-bundle/import/confirm';
import Information from 'components/common/information';
import MultipleItems from 'components/map/info-banner/multiple-items';
import LocationPermissions from 'components/location-permissions';
import CreateArea from 'containers/setup/create-area';
import ChooseTemplate from 'containers/chooseTemplate';
import DeleteAccount from 'containers/delete-account';
import Assignments from 'containers/assignments';
import AssignmentDetails from 'containers/assignmentDetails';
import Topbar from 'components/common/topbar';
import OfflineModal from 'components/common/topbar/offlineModal';

/**
 * Registers a component with React Native Navigation
 *
 * @param {string} name The name of the screen
 * @param {Object} Screen The component to register
 * @param {Object} Provider A provider component to wrap the screen in
 * @param {Object} store The redux store to give to the provider
 * @param {boolean} wrapInSafeAreaProvider Allows you to disable wrapping in safe area provider. This is useful as for example wrapping in safe area provider breaks RNN overlay's `interceptTouchOutside`
 */
function registerComponent(name, Screen, Provider, store, wrapInSafeAreaProvider = true, bannerNeeded = true) {
  const Wrapper = wrapInSafeAreaProvider ? SafeAreaProvider : React.Fragment;
  Navigation.registerComponent(
    name,
    () => props => (
      <Provider store={store}>
        <Wrapper>
          {bannerNeeded && <Topbar nativeID="offlineBannerComponent" />}
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
  registerComponent('ForestWatcher.Home', Home, Provider, store, true, false);
  registerComponent('ForestWatcher.ImportMappingFileRename', ImportMappingFileRename, Provider, store);
  registerComponent('ForestWatcher.ImportMappingFileType', ImportMappingFileType, Provider, store);
  registerComponent('ForestWatcher.ImportMappingFileError', ImportMappingFileError, Provider, store);
  registerComponent('ForestWatcher.Login', Login, Provider, store, true, false);
  registerComponent('ForestWatcher.LoginEmail', EmailLogin, Provider, store, true, false);
  registerComponent('ForestWatcher.SetupBoundaries', SetupBoundaries, Provider, store, true, false);
  registerComponent('ForestWatcher.SetupCountry', SetupCountry, Provider, store);
  registerComponent('ForestWatcher.SetupOverview', SetupOverview, Provider, store);
  registerComponent('ForestWatcher.ShapefileOverview', ShapefileOverview, Provider, store);
  registerComponent('ForestWatcher.Dashboard', Dashboard, Provider, store);
  registerComponent('ForestWatcher.Map', Map, Provider, store, true, false);
  registerComponent('ForestWatcher.MapWalkthrough', MapWalkthrough, Provider, store, true, false);
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
  registerComponent('ForestWatcher.Sync', Sync, Provider, store, true, false);
  registerComponent('ForestWatcher.Answers', Answers, Provider, store);
  registerComponent('ForestWatcher.MapLayersDrawer', MapSidebar, Provider, store, true, false);
  registerComponent('ForestWatcher.ErrorLightbox', ErrorLightbox, Provider, store, true, false);
  registerComponent('ForestWatcher.ToastNotification', ToastNotification, Provider, store, false, false);
  registerComponent('ForestWatcher.Routes', Routes, Provider, store);
  registerComponent('ForestWatcher.RouteDetail', RouteDetail, Provider, store);
  registerComponent('ForestWatcher.SaveRoute', SaveRoute, Provider, store);
  registerComponent('ForestWatcher.Welcome', Welcome, Provider, store, true, false);
  registerComponent('ForestWatcher.AlertLayerSettings', AlertLayerSettings, Provider, store);
  registerComponent('ForestWatcher.RoutesLayerSettings', RoutesLayerSettings, Provider, store);
  registerComponent('ForestWatcher.ReportsLayerSettings', ReportLayerSettings, Provider, store);
  registerComponent('ForestWatcher.ContextualLayersLayerSettings', ContextualLayersLayerSettings, Provider, store);
  registerComponent('ForestWatcher.BasemapLayerSettings', BasemapLayerSettings, Provider, store);
  registerComponent('ForestWatcher.GFWLayers', GFWContextualLayers, Provider, store);
  registerComponent('ForestWatcher.GFWLayerDownload', GFWContextualLayerDownload, Provider, store);
  registerComponent('ForestWatcher.ImportBundleStart', ImportSharingBundleStart, Provider, store);
  registerComponent('ForestWatcher.ImportBundleCustomItems', ImportSharingBundleCustomItems, Provider, store);
  registerComponent('ForestWatcher.ImportBundleCustomLayers', ImportSharingBundleCustomLayers, Provider, store);
  registerComponent('ForestWatcher.ImportBundleCustomBasemaps', ImportSharingBundleCustomBasemaps, Provider, store);
  registerComponent('ForestWatcher.ImportBundleConfirm', ImportSharingBundleConfirm, Provider, store);
  registerComponent('ForestWatcher.Information', Information, Provider, store, true, false);
  registerComponent('ForestWatcher.MultipleItems', MultipleItems, Provider, store);
  registerComponent('ForestWatcher.LocationPermissions', LocationPermissions, Provider, store, true, false);
  registerComponent('ForestWatcher.Teams', Teams, Provider, store);
  registerComponent('ForestWatcher.TeamDetails', TeamDetails, Provider, store);
  registerComponent('ForestWatcher.CreateArea', CreateArea, Provider, store);
  registerComponent('ForestWatcher.ChooseTemplate', ChooseTemplate, Provider, store);
  registerComponent('ForestWatcher.DeleteAccount', DeleteAccount, Provider, store);
  registerComponent('ForestWatcher.Assignments', Assignments, Provider, store);
  registerComponent('ForestWatcher.AssignmentDetails', AssignmentDetails, Provider, store);
  registerComponent('ForestWatcher.OfflineModal', OfflineModal, Provider, store, false, false);
}
