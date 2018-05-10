// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { createReport } from 'redux-modules/reports';
import { setCanDisplayAlerts, setActiveAlerts } from 'redux-modules/alerts';
import tracker from 'helpers/googleAnalytics';
import { getContextualLayer } from 'helpers/map';
import Map from 'components/map';
import { activeDataset } from 'helpers/area';

const BoundingBox = require('boundingbox');

function getAreaCoordinates(areaFeature) {
  return areaFeature.geometry.coordinates[0].map((coordinate) => (
    {
      longitude: coordinate[0],
      latitude: coordinate[1]
    }
  ));
}

function mapStateToProps(state: State) {
  const index = state.areas.selectedIndex;
  const area = state.areas.data[index] || null;
  let center = null;
  let areaCoordinates = null;
  let datasetSlug = null;
  let dataset = null;
  let areaProps = null;
  if (area) {
    dataset = activeDataset(area);
    if (dataset) {
      datasetSlug = dataset.slug;
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
        templateId: area.templateId
      };
    }
  }
  const { cache } = state.layers;
  const contextualLayer = getContextualLayer(state.layers);
  return {
    center,
    datasetSlug,
    contextualLayer,
    areaCoordinates,
    area: areaProps,
    isConnected: state.offline.online,
    coordinatesFormat: state.app.coordinatesFormat,
    canDisplayAlerts: state.alerts.canDisplayAlerts,
    basemapLocalTilePath: (area && area.id && cache.basemap && cache.basemap[area.id]) || '',
    ctxLayerLocalTilePath: cache[state.layers.activeLayer] ? cache[state.layers.activeLayer][area.id] : ''
  };
}


function mapDispatchToProps(dispatch, { navigation }) {
  return {
    setActiveAlerts: () => dispatch(setActiveAlerts()),
    createReport: (report) => {
      dispatch(createReport(report));
      tracker.trackEvent('Report', 'Create Report', { label: 'Click Done', value: 0 });
    },
    navigate: (routeName, params) => {
      navigation.navigate(routeName, params);
    },
    setCanDisplayAlerts: canDisplay => dispatch(setCanDisplayAlerts(canDisplay))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
