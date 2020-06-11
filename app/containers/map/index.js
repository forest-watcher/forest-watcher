// @flow
import type { Area } from 'types/areas.types';
import type { Coordinates } from 'types/common.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { Location, Route } from 'types/routes.types';
import type { BasicReport } from 'types/reports.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setSelectedAreaId } from 'redux-modules/areas';
import { createReport } from 'redux-modules/reports';
import { discardActiveRoute, getRoutesById, setRouteDestination } from 'redux-modules/routes';
import { setCanDisplayAlerts, setActiveAlerts } from 'redux-modules/alerts';
import { getImportedContextualLayersById } from 'redux-modules/layers';
import { trackRouteFlowEvent, trackReportingStarted, type ReportingSource } from 'helpers/analytics';
import { getContextualLayer } from 'helpers/map';
import { shouldBeConnected } from 'helpers/app';
import { getSelectedArea, activeDataset } from 'helpers/area';
import Map from 'components/map';
import { coordsArrayToObject } from 'helpers/location';
import { DEFAULT_LAYER_SETTINGS, getActiveBasemap } from 'redux-modules/layerSettings';

type OwnProps = {|
  +componentId: string,
  previousRoute: Route
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
  const area: ?Area = getSelectedArea(state.areas.data, state.areas.selectedAreaId);
  let areaCoordinates: ?Array<Coordinates> = null;
  let dataset = null;
  let areaProps = null;
  if (area) {
    dataset = activeDataset(area);
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
  const { cache } = state.layers;
  const contextualLayer = getContextualLayer(state.layers);
  const route = reconcileRoutes(state.routes.activeRoute, ownProps.previousRoute);
  const allRouteIds = state.routes.previousRoutes.map(item => item.id);
  const featureId = area?.id || route?.id || '';
  const layerSettings = state.layerSettings?.[featureId] || DEFAULT_LAYER_SETTINGS;

  return {
    contextualLayer,
    areaCoordinates,
    isTracking: !!state.routes.activeRoute,
    route,
    allRouteIds,
    area: areaProps,
    layerSettings,
    featureId,
    basemap: getActiveBasemap(featureId, state),
    isConnected: shouldBeConnected(state),
    isOfflineMode: state.app.offlineMode,
    coordinatesFormat: state.app.coordinatesFormat,
    canDisplayAlerts: state.alerts.canDisplayAlerts,
    reportedAlerts: state.alerts.reported,
    basemapLocalTilePath: (area && area.id && cache.basemap && cache.basemap[area.id]) || '',
    ctxLayerLocalTilePath:
      area && state.layers.activeLayer && cache[state.layers.activeLayer]
        ? cache[state.layers.activeLayer][area.id]
        : '',
    mapWalkthroughSeen: state.app.mapWalkthroughSeen
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    ...bindActionCreators(
      {
        setActiveAlerts,
        setCanDisplayAlerts,
        setSelectedAreaId
      },
      dispatch
    ),
    createReport: (report: BasicReport, source: ReportingSource) => {
      dispatch(createReport(report));
      let numAlertsInReport = 0;
      if (report.clickedPosition) {
        const parsedAlerts = JSON.parse(report.clickedPosition);
        numAlertsInReport = parsedAlerts.length;
      }
      trackReportingStarted(numAlertsInReport, source);
    },
    getImportedContextualLayersById: layerIds => {
      return dispatch(getImportedContextualLayersById(layerIds));
    },
    onStartTrackingRoute: (location: Location, areaId: string) => {
      trackRouteFlowEvent('started');
      dispatch(setRouteDestination(location, areaId));
    },
    onCancelTrackingRoute: () => {
      trackRouteFlowEvent('disregardedFromMap');
      dispatch(discardActiveRoute());
    },
    getRoutesById: (routeIds: Array<string>) => {
      return dispatch(getRoutesById(routeIds));
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Map);
