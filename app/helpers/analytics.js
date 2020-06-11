// @flow
import analytics from '@react-native-firebase/analytics';

type LoginMethod = 'email' | 'facebook' | 'twitter' | 'google';
type MenuButtonType = 'areas' | 'reports' | 'routes' | 'settings';
type DownloadableContentType = 'basemap' | 'layer';
type ImportableContentType = 'area' | 'basemap' | 'bundle' | 'layer' | 'report' | 'route';
type SharableContentType = 'area' | 'bundle' | 'report' | 'route' | 'layer';
type AlertType = 'glad' | 'viirs' | 'none' | 'glad_viirs';
type ImportableLayerCategories = 'all' | 'own' | 'imported' | 'none';
type RoutingAction = 'started' | 'saved' | 'disregardedFromMap' | 'disregardedOnLaunch';
type RouteDifficulty = 'easy' | 'medium' | 'hard';
type ReportingOutcome = 'cancelled' | 'saved' | 'completed' | 'deleted';
export type ReportingSource = 'singleAlert' | 'alertGroup' | 'custom' | 'customWhileRouting' | 'currentLocation';

/// MISC

export const disableAnalytics = (disabled: boolean) => {
  analytics().setAnalyticsCollectionEnabled(!disabled);
};

export const trackLogin = (method: ?LoginMethod) => {
  console.warn(`trackLogin - ${method}`);
  return;

  // eslint-disable-next-line no-unreachable
  analytics().logLogin({
    method: method ?? 'unknown'
  });
};

export const trackMenuButtonPress = (menuButton: MenuButtonType) => {
  console.warn(`trackMenuButtonPress - ${menuButton}`);
  return;
  // eslint-disable-next-line no-unreachable
  analytics().logEvent('menu_button_tap', {
    screen_name: menuButton
  });
};

export const trackScreenView = (screenName: string) => {
  console.warn(`trackScreenView - ${screenName}`);
  return;
  // eslint-disable-next-line no-unreachable
  analytics().setCurrentScreen(screenName, screenName);
};

/// AREA

export const trackAreaCreationFlowStarted = () => {
  console.warn(`trackAreaCreationFlowStarted`);
  return;
  // eslint-disable-next-line no-unreachable
  analytics().logLevelStart({
    level_name: 'area_create'
  });
};

// areaSize is square meters, so we must divide by 1000000 to get square km.
// we also round it 3dp so firebase is fine with it
export const trackAreaCreationFlowEnded = (areaSize: number) => {
  const kmSquaredValue = parseFloat((areaSize / 1000000).toFixed(3));
  console.warn(`trackAreaCreationFlowEnded - ${kmSquaredValue}`);
  return;
  // eslint-disable-next-line no-unreachable
  analytics().logLevelEnd({
    level_name: 'area_create',
    value: kmSquaredValue
  });
};

const areaDownloadTimers: { [id: string]: number } = {};

export const trackAreaDownloadFlowStarted = (areaId: string) => {
  areaDownloadTimers[areaId] = Date.now();
  console.warn(`trackAreaDownloadFlowStarted - ${areaId}`);
  return;

  // eslint-disable-next-line no-unreachable
  analytics().logLevelStart({
    level_name: 'area_download'
  });
};

export const trackAreaDownloadFlowEnded = (areaId: string, success: boolean) => {
  const duration = areaDownloadTimers[areaId] ? Math.ceil((Date.now() - areaDownloadTimers[areaId]) / 1000) : 0;
  delete areaDownloadTimers[areaId];
  console.warn(`trackAreaDownloadFlowEnded - ${areaId} ${duration} ${success}`);
  return;
  // eslint-disable-next-line no-unreachable
  analytics().logLevelEnd({
    level_name: 'area_download',
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

  console.warn(`trackImportedContent - ${contentType} ${fileType} ${success} ${fileSize}`);
  return;
  // eslint-disable-next-line no-unreachable
  analytics().logEvent('imported_content', {
    content_type: contentType,
    file_type: fileType,
    success: success ? 1 : 0,
    length: fileSize
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
  return;
  // eslint-disable-next-line no-unreachable
  analytics().logEvent('downloaded_content', {
    content_type: contentType,
    time_taken: duration,
    success: success ? 1 : 0
  });
};

/// EXPORT

export const trackSharedContent = (contentType: SharableContentType) => {
  console.warn(`trackSharedContent - ${contentType}`);
  return;
  // eslint-disable-next-line no-unreachable
  analytics().logShare({
    content_type: contentType
  });
};

/// MAP LAYERS

export const trackRoutesToggled = (routeTypes: 'all' | 'some' | 'none', routesTotal: number, enabled: boolean) => {
  console.warn(`trackRoutesToggled - ${routeTypes} ${routesTotal} ${enabled}`);
  return;
  // eslint-disable-next-line no-unreachable
  analytics().logEvent('routes_toggled', {
    layer_name: routeTypes,
    value: routesTotal,
    layer_enabled: enabled ? 1 : 0
  });
};

export const trackLayersToggled = (layerName: ?string, enabled: boolean) => {
  console.warn(`trackLayersToggled - ${layerName} ${enabled}`);
  return;

  // eslint-disable-next-line no-unreachable
  analytics().logEvent('layer_toggled', {
    layer_name: layerName ?? 'unknown',
    layer_enabled: enabled ? 1 : 0
  });
};

export const trackAlertTypeToggled = (alertType: AlertType, enabled: boolean) => {
  console.warn(`trackAlertTypeToggled - ${alertType} ${enabled}`);
  return;

  // eslint-disable-next-line no-unreachable
  analytics().logEvent('alert_type_toggled', {
    layer_name: alertType,
    layer_enabled: enabled ? 1 : 0
  });
};

export const trackReportsToggled = (reportType: ImportableLayerCategories, enabled: boolean) => {
  console.warn(`trackReportsToggled - ${reportType} ${enabled}`);
  return;
  // eslint-disable-next-line no-unreachable
  analytics().logEvent('reports_toggled', {
    layer_name: reportType,
    layer_enabled: enabled ? 1 : 0
  });
};

/// ROUTES

export const trackRouteFlowEvent = (routingAction: RoutingAction) => {
  console.warn(`trackRouteFlowEvent - ${routingAction}`);
  return;
  // eslint-disable-next-line no-unreachable
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
  return;
  // eslint-disable-next-line no-unreachable
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
  return;

  // eslint-disable-next-line no-unreachable
  analytics().logLevelStart({
    level_name: 'route_download'
  });
};

export const trackRouteDownloadFlowEnded = (routeId: string, success: boolean) => {
  const duration = routeDownloadTimers[routeId] ? Math.ceil((Date.now() - routeDownloadTimers[routeId]) / 1000) : 0;
  delete routeDownloadTimers[routeId];
  console.warn(`trackRouteDownloadFlowEnded - ${routeId} ${duration} ${success}`);
  return;
  // eslint-disable-next-line no-unreachable
  analytics().logLevelEnd({
    level_name: 'route_download',
    time_taken: duration,
    success: success ? 1 : 0
  });
};

/// REPORTING

let startReportingTimestamp: ?number = null;

export const trackReportingStarted = (totalAlerts: number, source: ReportingSource) => {
  console.warn(`trackReportingStarted - ${totalAlerts} ${source}`);
  startReportingTimestamp = Date.now();
  return;
  // eslint-disable-next-line no-unreachable
  analytics().logLevelStart({
    level_name: 'report',
    value: totalAlerts, // this is different from original event
    source: source
  });
};

export const trackReportingConcluded = (reportOutcome: ReportingOutcome, screenName: string) => {
  const timeTaken = startReportingTimestamp != null ? Math.ceil((Date.now() - startReportingTimestamp) / 1000) : 0;
  console.warn(`trackReportingConcluded - ${reportOutcome} ${screenName} ${timeTaken}`);
  startReportingTimestamp = null;
  return;
  // eslint-disable-next-line no-unreachable
  analytics().logLevelEnd({
    level_name: 'report',
    success: reportOutcome === 'completed' || reportOutcome === 'saved',
    report_outcome: reportOutcome,
    time_taken: timeTaken,
    screen_name: screenName
  });
};
