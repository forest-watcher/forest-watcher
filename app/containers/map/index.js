// @flow
import type { Coordinates } from 'types/common.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { Route } from 'types/routes.types';
import type { BasicReport, ReportArea } from 'types/reports.types';

import { connect } from 'react-redux';
import { createReport } from 'redux-modules/reports';
import { discardActiveRoute, setRouteDestination } from 'redux-modules/routes';
import { trackRouteFlowEvent, trackReportingStarted, type ReportingSource } from 'helpers/analytics';
import { shouldBeConnected } from 'helpers/app';
import { activeDataset } from 'helpers/area';
import Map from 'components/map';
import { coordsArrayToObject } from 'helpers/location';
import { DEFAULT_LAYER_SETTINGS, getActiveBasemap } from 'redux-modules/layerSettings';

type OwnProps = {|
  +areaId: ?string,
  +componentId: string,
  +featureId: string,
  +routeId: ?string
|};

function getAreaCoordinates(areaFeature): Array<Coordinates> {
  switch (areaFeature.geometry.type) {
    case 'MultiPolygon': {
      // When KML files are uploaded in the webapp they are always turned into MultiPolygons even if that multi polygon
      // only consists of a single polygon - just take the first polygon
      return areaFeature.geometry.coordinates[0][0].map(coordinate => coordsArrayToObject(coordinate));
    }
    case 'Polygon':
    default: {
      // Handle anything we don't recognise as a Polygon
      return areaFeature.geometry.coordinates[0].map(coordinate => coordsArrayToObject(coordinate));
    }
  }
}

function reconcileRoutes(activeRoute: ?Route, previousRoute: ?Route): ?Route {
  if (activeRoute) {
    return activeRoute;
  } else if (previousRoute) {
    return previousRoute;
  } else {
    return null;
  }
}

function mapStateToProps(state: State, ownProps: OwnProps) {
  const featureId = ownProps.featureId;
  const area = state.areas.data.find(item => item.id === ownProps.areaId);
  const previousRoute = state.routes.previousRoutes.find(item => item.id === ownProps.routeId);
  let areaCoordinates: ?Array<Coordinates> = null;
  let areaProps: ?ReportArea = null;
  if (area) {
    const dataset = activeDataset(area);
    const geostore = area.geostore;
    const areaFeatures = (geostore && geostore.geojson && geostore.geojson.features[0]) || false;
    if (areaFeatures) {
      areaCoordinates = getAreaCoordinates(areaFeatures);
    }
    areaProps = {
      dataset,
      id: area.id,
      name: area.name,
      templateId: area.templateId || 'default'
    };
  }
  const route = reconcileRoutes(state.routes.activeRoute, previousRoute);
  const layerSettings = state.layerSettings?.[featureId] || DEFAULT_LAYER_SETTINGS;

  return {
    areaCoordinates,
    isTracking: !!state.routes.activeRoute,
    route,
    routes: state.routes.previousRoutes,
    area: areaProps,
    layerSettings,
    basemap: getActiveBasemap(featureId, state),
    isConnected: shouldBeConnected(state),
    isOfflineMode: state.app.offlineMode,
    coordinatesFormat: state.app.coordinatesFormat,
    reportedAlerts: state.alerts.reported,
    mapWalkthroughSeen: state.app.mapWalkthroughSeen
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps) {
  return {
    createReport: (report: BasicReport, source: ReportingSource) => {
      dispatch(createReport(report));
      let numAlertsInReport = 0;
      if (report.clickedPosition) {
        const parsedAlerts = JSON.parse(report.clickedPosition);
        numAlertsInReport = parsedAlerts.length;
      }
      trackReportingStarted(numAlertsInReport, source);
    },
    onStartTrackingRoute: (location: Coordinates) => {
      const areaId = ownProps.areaId;
      if (areaId) {
        trackRouteFlowEvent('started');
        dispatch(setRouteDestination(location, areaId));
      }
    },
    onCancelTrackingRoute: () => {
      trackRouteFlowEvent('discardedFromMap');
      dispatch(discardActiveRoute());
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Map);
