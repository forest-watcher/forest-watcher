// @flow
import analytics from '@react-native-firebase/analytics';
import { formatBytes } from 'helpers/data';

type LoginMethod = 'email' | 'facebook' | 'twitter' | 'google';
type MenuButtonType = 'areas' | 'reports' | 'routes' | 'settings';
type DownloadableContentType = 'basemap' | 'layer';
type ImportableContentType = 'area' | 'basemap' | 'bundle' | 'layer' | 'report' | 'route';
type SharableContentType = 'area' | 'basemap' | 'bundle' | 'report' | 'route' | 'layer';
type AlertType = 'glad' | 'viirs' | 'none' | 'glad_viirs';
type ImportableLayerCategories = 'all' | 'own' | 'imported' | 'none';
type RoutingAction = 'started' | 'saved' | 'discardedFromMap' | 'discardedOnLaunch';
type RouteDifficulty = 'easy' | 'medium' | 'hard';
type ReportingOutcome = 'cancelled' | 'saved' | 'completed' | 'deleted';
export type ReportingSource = 'singleAlert' | 'alertGroup' | 'custom' | 'customWhileRouting' | 'currentLocation';

/// MISC

// eslint-disable-next-line import/no-unused-modules
export const disableAnalytics = (disabled: boolean) => {
  analytics().setAnalyticsCollectionEnabled(!disabled);
};

export const trackLogin = (method: ?LoginMethod) => {
  analytics().logLogin({
    method: method ?? 'unknown'
  });
};

export const trackMenuButtonPress = (menuButton: MenuButtonType) => {
  analytics().logEvent('menu_button_tap', {
    screen_name: menuButton
  });
};

export const trackScreenView = (screenName: string) => {
  analytics().setCurrentScreen(screenName, screenName);
};

/// AREA

export const trackAreaCreationFlowStarted = () => {
  analytics().logEvent('area_creation_start');
};

// areaSize is square meters, so we must divide by 1000000 to get square km.
// we also round it 3dp so firebase is fine with it
export const trackAreaCreationFlowEnded = (areaSize: number) => {
  const kmSquaredValue = parseFloat((areaSize / 1000000).toFixed(3));

  analytics().logEvent('area_creation_end', {
    value: kmSquaredValue
  });
};

const areaDownloadTimers: { [id: string]: number } = {};

export const trackAreaDownloadFlowStarted = (areaId: string) => {
  areaDownloadTimers[areaId] = Date.now();

  analytics().logEvent('area_download_start');
};

export const trackAreaDownloadFlowEnded = (areaId: string, success: boolean) => {
  const duration = areaDownloadTimers[areaId] ? Math.ceil((Date.now() - areaDownloadTimers[areaId]) / 1000) : 0;
  delete areaDownloadTimers[areaId];

  analytics().logEvent('area_download_end', {
    time_taken: duration,
    success: success ? 1 : 0
  });
};

/// IMPORT

export const trackImportedContent = (
  contentType: ImportableContentType,
  fileName: string,
  success: boolean,
  fileSize?: ?number
) => {
  const fileType = fileName
    .split('.')
    .pop()
    .toLowerCase();

  analytics().logEvent('imported_content', {
    content_type: contentType,
    file_type: fileType,
    success: success ? 1 : 0,
    length: formatBytes(fileSize ?? 0)
  });
};

const contentDownloadTimers: { [id: string]: number } = {};

export const trackContentDownloadStarted = (id: string) => {
  contentDownloadTimers[id] = Date.now();
};

export const trackDownloadedContent = (contentType: DownloadableContentType, id: string, success: boolean) => {
  const duration = contentDownloadTimers[id] ? Math.ceil((Date.now() - contentDownloadTimers[id]) / 1000) : 0;
  delete contentDownloadTimers[id];

  analytics().logEvent('downloaded_content', {
    content_type: contentType,
    time_taken: duration,
    success: success ? 1 : 0
  });
};

/// EXPORT

export const trackSharedContent = (contentType: SharableContentType) => {
  analytics().logEvent('exported_content', {
    content_type: contentType
  });
};

/// MAP LAYERS

export const trackRoutesToggled = (routeTypes: 'all' | 'some' | 'none', routesTotal: number, enabled: boolean) => {
  analytics().logEvent('routes_toggled', {
    layer_name: routeTypes,
    value: routesTotal,
    layer_enabled: enabled ? 1 : 0
  });
};

export const trackLayersToggled = (layerId: ?string, enabled: boolean) => {
  analytics().logEvent('layer_toggled', {
    layer_id: layerId ?? 'unknown',
    layer_enabled: enabled ? 1 : 0
  });
};

export const trackAlertTypeToggled = (alertType: AlertType, enabled: boolean) => {
  analytics().logEvent('alert_type_toggled', {
    layer_name: alertType,
    layer_enabled: enabled ? 1 : 0
  });
};

export const trackReportsToggled = (reportType: ImportableLayerCategories, enabled: boolean) => {
  analytics().logEvent('reports_toggled', {
    layer_name: reportType,
    layer_enabled: enabled ? 1 : 0
  });
};

/// ROUTES

export const trackRouteFlowEvent = (routingAction: RoutingAction) => {
  analytics().logEvent('route_action', {
    action: routingAction
  });
};

export const trackRouteDetailsUpdated = (
  difficulty: RouteDifficulty,
  timeTaken: number, // provided in ms
  date: string,
  length: number //provided in m
) => {
  const durationInSeconds = parseInt(timeTaken / 1000);
  const distanceInKm = parseFloat((length / 1000).toFixed(3));

  analytics().logEvent('route_details_updated', {
    difficulty: difficulty,
    time_taken: durationInSeconds,
    date: date,
    value: distanceInKm
  });
};

const routeDownloadTimers: { [id: string]: number } = {};

export const trackRouteDownloadFlowStarted = (routeId: string) => {
  routeDownloadTimers[routeId] = Date.now();

  analytics().logEvent('route_download_start');
};

export const trackRouteDownloadFlowEnded = (routeId: string, success: boolean) => {
  const duration = routeDownloadTimers[routeId] ? Math.ceil((Date.now() - routeDownloadTimers[routeId]) / 1000) : 0;
  delete routeDownloadTimers[routeId];

  analytics().logEvent('route_download_end', {
    time_taken: duration,
    success: success ? 1 : 0
  });
};

/// REPORTING

let startReportingTimestamp: ?number = null;

export const trackReportingStarted = (totalAlerts: number, source: ReportingSource) => {
  startReportingTimestamp = Date.now();

  analytics().logEvent('report_start', {
    value: totalAlerts, // this is different from original event
    source: source
  });
};

export const trackReportingConcluded = (reportOutcome: ReportingOutcome, screenName: string) => {
  const timeTaken = startReportingTimestamp != null ? Math.ceil((Date.now() - startReportingTimestamp) / 1000) : 0;
  startReportingTimestamp = null;

  analytics().logEvent('report_end', {
    success: reportOutcome === 'completed' || reportOutcome === 'saved',
    report_outcome: reportOutcome,
    time_taken: timeTaken,
    screen_name: screenName
  });
};
