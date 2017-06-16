import { connect } from 'react-redux';
import { createReport } from 'redux-modules/reports';
import { setSyncModal } from 'redux-modules/app';
import { setCanDisplayAlerts } from 'redux-modules/alerts';
import tracker from 'helpers/googleAnalytics';
import Map from 'components/map';
import moment from 'moment';
import { activeDataset } from 'helpers/area';
import { getTotalActionsPending } from 'helpers/sync';
import { initDb, read } from 'helpers/database';

const supercluster = require('supercluster'); // eslint-disable-line
const BoundingBox = require('boundingbox');

function getAreaCoordinates(areaFeature) {
  return areaFeature.geometry.coordinates[0].map((coordinate) => (
    {
      longitude: coordinate[0],
      latitude: coordinate[1]
    }
  ));
}

function convertPoints(data) {
  return {
    type: 'MapCollection',
    features: data.map((value) => ({
      type: 'Map',
      properties: {
        lat: value.lat,
        long: value.long,
        date: value.date
      },
      geometry: {
        type: 'Point',
        coordinates: [
          value.long,
          value.lat
        ]
      }
    }))
  };
}

function createCluster(data) {
  const cluster = supercluster({
    radius: 120,
    maxZoom: 16, // Default: 16,
    nodeSize: 128
  });
  cluster.load(data.features);
  return cluster;
}

function mapStateToProps(state) {
  const index = state.areas.selectedIndex;
  const area = state.areas.data[index] || null;
  let areaId = null;
  let cluster = null;
  let center = null;
  let areaCoordinates = null;
  let alerts = [];
  let datasetSlug = null;
  if (area) {
    areaId = area.id;
    const dataset = activeDataset(area);
    datasetSlug = dataset.slug;
    const geostore = state.geostore.data[area.geostore];
    const areaFeatures = (geostore && geostore.geojson.features[0]) || false;
    if (areaFeatures) {
      center = new BoundingBox(areaFeatures).getCenter();
      areaCoordinates = getAreaCoordinates(areaFeatures);
    }
    const timeFrame = datasetSlug === 'viirs' ? 'day' : 'month';
    const limitRange = moment().subtract(dataset.startDate, timeFrame).valueOf();
    const realm = initDb();
    if (datasetSlug && state.alerts.canDisplayAlerts) {
      alerts = read(realm, 'Alert')
                      .filtered(`areaId = '${areaId}' AND slug = '${datasetSlug}' AND date > '${limitRange}'`)
                      .map((alert) => ({ lat: alert.lat, long: alert.long }));
      const geoPoints = convertPoints(alerts);
      cluster = geoPoints && createCluster(geoPoints);
    }
  }

  return {
    areaId,
    cluster,
    center,
    areaCoordinates,
    isConnected: state.offline.online,
    actionsPending: getTotalActionsPending(state),
    syncModalOpen: state.app.syncModalOpen,
    syncSkip: state.app.syncSkip,
    alerts,
    datasetSlug,
    canDisplayAlerts: state.alerts.canDisplayAlerts
  };
}


function mapDispatchToProps(dispatch, { navigation }) {
  return {
    createReport: (name, position) => {
      dispatch(createReport(name, position));
      tracker.trackEvent('Report', 'Create Report', { label: 'Click Done', value: 0 });
    },
    navigate: (routeName, params) => {
      navigation.navigate(routeName, params);
    },
    setSyncModal: open => dispatch(setSyncModal(open)),
    setCanDisplayAlerts: canDisplay => dispatch(setCanDisplayAlerts(canDisplay))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
