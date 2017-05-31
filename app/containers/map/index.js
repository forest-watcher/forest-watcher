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
  let parsedArea = {};
  let areaFeatures = null;
  let enabledDataset = null;
  let center = null;
  let areaCoordinates = null;
  if (area) {
    parsedArea = {
      id: area.id,
      name: area.attributes.name,
      geostoreId: area.attributes.geostore,
      datasets: area.datasets
    };
    areaFeatures = state.geostore.data[parsedArea.geostoreId].features[0];
    enabledDataset = activeDataset(area);
  }

  if (areaFeatures) {
    center = new BoundingBox(areaFeatures).getCenter();
    areaCoordinates = getAreaCoordinates(areaFeatures);
  }

  return {
    area: parsedArea,
    enabledDataset,
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
