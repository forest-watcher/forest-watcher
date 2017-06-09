import { connect } from 'react-redux';
import { createReport } from 'redux-modules/reports';
import tracker from 'helpers/googleAnalytics';
import Map from 'components/map';
import { activeDataset } from 'helpers/area';
import { initDb, read } from 'helpers/database';

const BoundingBox = require('boundingbox');

function getAreaCoordinates(areaFeature) {
  return areaFeature.geometry.coordinates[0].map((coordinate) => (
    {
      longitude: coordinate[0],
      latitude: coordinate[1]
    }
  ));
}

function mapStateToProps(state) {
  const index = state.areas.selectedIndex;
  const area = state.areas.data[index] || null;
  let areaId = null;
  let areaFeatures = null;
  let dataset = null;
  let datasetSlug = null;
  let center = null;
  let areaCoordinates = null;
  let startDate = null;
  let endDate = null;
  if (area) {
    dataset = activeDataset(area);
    datasetSlug = dataset.slug;
    startDate = dataset.startDate;
    endDate = dataset.endDate;
    areaFeatures = (state.geostore.data[area.geostore] && state.geostore.data[area.geostore].data.features[0]) || false;
    if (areaFeatures) {
      center = new BoundingBox(areaFeatures).getCenter();
      areaCoordinates = getAreaCoordinates(areaFeatures);
    }
    areaId = area.id;
  }
  const realm = initDb();
  const alerts = read(realm, 'Alert')
                  .filtered(`areaId = '${areaId}'`)
                  .map((alert) => ({ lat: alert.lat, long: alert.long }));

  return {
    areaId,
    datasetSlug,
    startDate,
    endDate,
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
