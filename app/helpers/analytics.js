// @flow
import analytics from '@react-native-firebase/analytics';
import { formatBytes } from 'helpers/data';

type LoginMethod = 'email' | 'facebook' | 'twitter' | 'google';
type MenuButtonType = 'areas' | 'reports' | 'routes' | 'settings';
type DownloadableContentType = 'basemap' | 'layer';
type ImportableContentType = 'area' | 'basemap' | 'bundle' | 'layer' | 'report' | 'route';
type SharableContentType = 'area' | 'bundle' | 'report' | 'route' | 'layer';
type AlertType = 'glad' | 'viirs' | 'none' | 'glad_viirs';
type ImportableLayerCategories = 'all' | 'own' | 'imported' | 'none';
type RoutingAction = 'started' | 'saved' | 'discardedFromMap' | 'discardedOnLaunch';
type RouteDifficulty = 'easy' | 'medium' | 'hard';
type ReportingOutcome = 'cancelled' | 'saved' | 'completed' | 'deleted';
export type ReportingSource = 'singleAlert' | 'alertGroup' | 'custom' | 'customWhileRouting' | 'currentLocation';

/// MISC

export const disableAnalytics = (disabled: boolean) => {
  analytics().setAnalyticsCollectionEnabled(!disabled);
};

export const trackLogin = (method: ?LoginMethod) => {
  console.warn(`trackLogin - ${method}`);

  analytics().logLogin({
    method: method ?? 'unknown'
  });
};

export const trackMenuButtonPress = (menuButton: MenuButtonType) => {
  console.warn(`trackMenuButtonPress - ${menuButton}`);

  analytics().logEvent('menu_button_tap', {
    screen_name: menuButton
  });
};

export const trackScreenView = (screenName: string) => {
  console.warn(`trackScreenView - ${screenName}`);

  analytics().setCurrentScreen(screenName, screenName);
};

/// AREA

export const trackAreaCreationFlowStarted = () => {
  console.warn(`trackAreaCreationFlowStarted`);

  analytics().logEvent('area_creation_start');
};

// areaSize is square meters, so we must divide by 1000000 to get square km.
// we also round it 3dp so firebase is fine with it
export const trackAreaCreationFlowEnded = (areaSize: number) => {
  const kmSquaredValue = parseFloat((areaSize / 1000000).toFixed(3));
  console.warn(`trackAreaCreationFlowEnded - ${kmSquaredValue}`);

  analytics().logEvent('area_creation_end', {
    value: kmSquaredValue
  });
};

const areaDownloadTimers: { [id: string]: number } = {};

export const trackAreaDownloadFlowStarted = (areaId: string) => {
  areaDownloadTimers[areaId] = Date.now();
  console.warn(`trackAreaDownloadFlowStarted - ${areaId}`);

  analytics().logEvent('area_download_start');
};

export const trackAreaDownloadFlowEnded = (areaId: string, success: boolean) => {
  const duration = areaDownloadTimers[areaId] ? Math.ceil((Date.now() - areaDownloadTimers[areaId]) / 1000) : 0;
  delete areaDownloadTimers[areaId];
  console.warn(`trackAreaDownloadFlowEnded - ${areaId} ${duration} ${success}`);

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

  console.warn(`trackImportedContent - ${contentType} ${fileType} ${success} ${formatBytes(fileSize ?? 0)}`);

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
  console.warn(`trackContentDownloadStarted - ${id}`);
};

export const trackDownloadedContent = (contentType: DownloadableContentType, id: string, success: boolean) => {
  const duration = contentDownloadTimers[id] ? Math.ceil((Date.now() - contentDownloadTimers[id]) / 1000) : 0;
  delete contentDownloadTimers[id];
  console.warn(`trackDownloadedContent - ${contentType} ${id} ${duration} ${success}`);

  analytics().logEvent('downloaded_content', {
    content_type: contentType,
    time_taken: duration,
    success: success ? 1 : 0
  });
};

/// EXPORT

export const trackSharedContent = (contentType: SharableContentType) => {
  console.warn(`trackSharedContent - ${contentType}`);

  analytics().logEvent('exported_content', {
    content_type: contentType
  });
};

/// MAP LAYERS

export const trackRoutesToggled = (routeTypes: 'all' | 'some' | 'none', routesTotal: number, enabled: boolean) => {
  console.warn(`trackRoutesToggled - ${routeTypes} ${routesTotal} ${enabled}`);

  analytics().logEvent('routes_toggled', {
    layer_name: routeTypes,
    value: routesTotal,
    layer_enabled: enabled ? 1 : 0
  });
};

export const trackLayersToggled = (layerId: ?string, enabled: boolean) => {
  console.warn(`trackLayersToggled - ${layerId} ${enabled}`);

  analytics().logEvent('layer_toggled', {
    layer_id: layerId ?? 'unknown',
    layer_enabled: enabled ? 1 : 0
  });
};

export const trackAlertTypeToggled = (alertType: AlertType, enabled: boolean) => {
  console.warn(`trackAlertTypeToggled - ${alertType} ${enabled}`);

  analytics().logEvent('alert_type_toggled', {
    layer_name: alertType,
    layer_enabled: enabled ? 1 : 0
  });
};

export const trackReportsToggled = (reportType: ImportableLayerCategories, enabled: boolean) => {
  console.warn(`trackReportsToggled - ${reportType} ${enabled}`);

  analytics().logEvent('reports_toggled', {
    layer_name: reportType,
    layer_enabled: enabled ? 1 : 0
  });
};

/// ROUTES

export const trackRouteFlowEvent = (routingAction: RoutingAction) => {
  console.warn(`trackRouteFlowEvent - ${routingAction}`);

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
  console.warn(`trackRouteDetailsUpdated - ${difficulty} ${durationInSeconds} ${date} ${distanceInKm}`);

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
  console.warn(`trackRouteDownloadFlowStarted - ${routeId}`);

  analytics().logEvent('route_download_start');
};

export const trackRouteDownloadFlowEnded = (routeId: string, success: boolean) => {
  const duration = routeDownloadTimers[routeId] ? Math.ceil((Date.now() - routeDownloadTimers[routeId]) / 1000) : 0;
  delete routeDownloadTimers[routeId];
  console.warn(`trackRouteDownloadFlowEnded - ${routeId} ${duration} ${success}`);

  analytics().logEvent('route_download_end', {
    time_taken: duration,
    success: success ? 1 : 0
  });
};

/// REPORTING

let startReportingTimestamp: ?number = null;

export const trackReportingStarted = (totalAlerts: number, source: ReportingSource) => {
  console.warn(`trackReportingStarted - ${totalAlerts} ${source}`);
  startReportingTimestamp = Date.now();

  analytics().logEvent('report_start', {
    value: totalAlerts, // this is different from original event
    source: source
  });
};

export const trackReportingConcluded = (reportOutcome: ReportingOutcome, screenName: string) => {
  const timeTaken = startReportingTimestamp != null ? Math.ceil((Date.now() - startReportingTimestamp) / 1000) : 0;
  console.warn(`trackReportingConcluded - ${reportOutcome} ${screenName} ${timeTaken}`);
  startReportingTimestamp = null;

  analytics().logEvent('report_end', {
    success: reportOutcome === 'completed' || reportOutcome === 'saved',
    report_outcome: reportOutcome,
    time_taken: timeTaken,
    screen_name: screenName
  });
};
