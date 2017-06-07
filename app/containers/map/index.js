import { connect } from 'react-redux';
import { createReport } from 'redux-modules/reports';
import tracker from 'helpers/googleAnalytics';
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
    areaFeatures = (state.geostore.data[area.geostore] && state.geostore.data[area.geostore].features[0]) || false;
    if (areaFeatures) {
      center = new BoundingBox(areaFeatures).getCenter();
      areaCoordinates = getAreaCoordinates(areaFeatures);
    }
    areaId = area.id;
  }


  return {
    areaId,
    datasetSlug,
    startDate,
    endDate,
    center,
    areaCoordinates,
    isConnected: state.offline.online
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
