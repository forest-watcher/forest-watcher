// @flow
import type { Coordinates } from 'types/common.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { Route } from 'types/routes.types';
import type { Report, ReportsList, ReportArea, Template } from 'types/reports.types';

import { flatten } from 'lodash';
import memoizeOne from 'memoize-one';
import { connect } from 'react-redux';
import { discardActiveRoute, setRouteDestination } from 'redux-modules/routes';
import { trackRouteFlowEvent } from 'helpers/analytics';
import { shouldBeConnected } from 'helpers/app';
import { activeDataset } from 'helpers/area';
import Map from 'components/map';
import { coordsArrayToObject } from 'helpers/location';
import { DEFAULT_LAYER_SETTINGS, getActiveBasemap } from 'redux-modules/layerSettings';
import type { AssignmentLocation } from 'types/assignments.types';

type OwnProps = {|
  +teamId: ?string,
  +areaId: ?string,
  +componentId: string,
  +featureId: string,
  +routeId: ?string,
  +templates: ?Array<Template>,
  +preSelectedAlerts?: ?Array<AssignmentLocation>
|};

function getAreaCoordinates(areaFeature): ?Array<Coordinates> {
  if (!areaFeature?.geometry?.coordinates?.length) {
    return null;
  }
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

/**
 * Return an array of coordinates that have been reported on.
 *
 * Memoize the result so we don't create a new array every time mapStateToProps is called below.
 */
const getReportedCoordinates = memoizeOne(
  (reportsMap: ReportsList): $ReadOnlyArray<Coordinates> => {
    const reports: Array<Report> = Object.keys(reportsMap).map(key => reportsMap[key]);
    const locations: Array<Array<{ lat?: number, long?: number }>> = reports.map(report => {
      const clickedPositions = report.clickedPosition ? JSON.parse(report.clickedPosition) : [];
      // Check we've got an array back from JSON.parse
      return Array.isArray(clickedPositions) ? clickedPositions : [];
    });
    return flatten(locations)
      .map(item =>
        item && item.lat !== undefined && item.lon !== undefined
          ? {
              latitude: item.lat ?? 0,
              longitude: item.lon ?? 0
            }
          : null
      )
      .filter(Boolean);
  }
);

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
  const area = state.areas.data.find(
    item => item.id === ownProps.areaId && (!ownProps.teamId || item.teamId === ownProps.teamId)
  );
  const previousRoute = state.routes.previousRoutes.find(item => item.id === ownProps.routeId);
  let areaCoordinates: ?Array<Coordinates> = null;
  let areaProps: ?ReportArea = null;
  if (area) {
    const dataset = activeDataset(area);
    const areaFeatures = area.geostore?.geojson?.features?.[0] ?? null;
    if (areaFeatures) {
      areaCoordinates = getAreaCoordinates(areaFeatures);
    }
    areaProps = {
      ...area,
      dataset,
      templateId: area.templateId || 'default'
    };
  }

  const route = reconcileRoutes(state.routes.activeRoute, previousRoute);
  const layerSettings = state.layerSettings?.[featureId] || DEFAULT_LAYER_SETTINGS;

  const reportedCoordinates = getReportedCoordinates(state.reports.list);

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
    reportedAlerts: reportedCoordinates,
    mapWalkthroughSeen: state.app.mapWalkthroughSeen,
    templates: ownProps.templates || areaProps?.reportTemplate
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps) {
  return {
    onStartTrackingRoute: (location: Coordinates) => {
      const areaId = ownProps.areaId;
      if (areaId) {
        trackRouteFlowEvent('started');
        dispatch(setRouteDestination(location, areaId, ownProps.teamId));
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
