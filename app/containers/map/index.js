// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setSelectedAreaId } from 'redux-modules/areas';
import { createReport } from 'redux-modules/reports';
import { setCanDisplayAlerts, setActiveAlerts } from 'redux-modules/alerts';
import tracker from 'helpers/googleAnalytics';
import { getContextualLayer } from 'helpers/map';
import { shouldBeConnected } from 'helpers/app';
import { getSelectedArea, activeDataset } from 'helpers/area';
import Map from 'components/map';

const BoundingBox = require('boundingbox');

function getAreaCoordinates(areaFeature) {
  return areaFeature.geometry.coordinates[0].map(coordinate => ({
    longitude: coordinate[0],
    latitude: coordinate[1]
  }));
}

function mapStateToProps(state: State) {
  const area = getSelectedArea(state.areas.data, state.areas.selectedAreaId);
  let center = null;
  let areaCoordinates = null;
  let dataset = null;
  let areaProps = null;
  if (area) {
    dataset = activeDataset(area);
    const geostore = area.geostore;
    const areaFeatures = (geostore && geostore.geojson && geostore.geojson.features[0]) || false;
    if (areaFeatures) {
      center = new BoundingBox(areaFeatures).getCenter();
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
  return {
    center,
    contextualLayer,
    areaCoordinates,
    area: areaProps,
    isConnected: shouldBeConnected(state),
    coordinatesFormat: state.app.coordinatesFormat,
    canDisplayAlerts: state.alerts.canDisplayAlerts,
    basemapLocalTilePath: (area && area.id && cache.basemap && cache.basemap[area.id]) || '',
    ctxLayerLocalTilePath: area && cache[state.layers.activeLayer] ? cache[state.layers.activeLayer][area.id] : ''
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    ...bindActionCreators(
      {
        setActiveAlerts,
        setCanDisplayAlerts,
        setSelectedAreaId
      },
      dispatch
    ),
    createReport: report => {
      dispatch(createReport(report));
      tracker.trackEvent('Report', 'Create Report', { label: 'Click Done', value: 0 });
    },
    navigate: (routeName, params) => {
      navigation.navigate(routeName, params);
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
