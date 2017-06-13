import { connect } from 'react-redux';
import { createReport } from 'redux-modules/reports';
import tracker from 'helpers/googleAnalytics';
import Map from 'components/map';
import { activeDataset } from 'helpers/area';
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
    radius: 60,
    maxZoom: 15, // Default: 16,
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
  if (area) {
    areaId = area.id;
    const dataset = activeDataset(area);
    const areaFeatures = (state.geostore.data[area.geostore] && state.geostore.data[area.geostore].data.features[0]) || false;
    if (areaFeatures) {
      center = new BoundingBox(areaFeatures).getCenter();
      areaCoordinates = getAreaCoordinates(areaFeatures);
    }
    const realm = initDb();
    const limitRange = parseInt(dataset.startDate, 10) || 7;
    alerts = read(realm, 'Alert')
                    .filtered(`areaId = '${areaId}' AND slug = '${dataset.slug}' AND date < '${limitRange}'`) // startDate is a int => days in Viirs and months in Glad
                    .map((alert) => ({ lat: alert.lat, long: alert.long }));
    const geoPoints = convertPoints(alerts);
    cluster = geoPoints && createCluster(geoPoints);
  }

  return {
    areaId,
    cluster,
    center,
    areaCoordinates,
    isConnected: state.offline.online,
    alerts
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
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
