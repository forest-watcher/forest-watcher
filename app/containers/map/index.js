import { connect } from 'react-redux';
import { createReport } from 'redux-modules/reports';
import { setSyncModal } from 'redux-modules/app';
import { setCanDisplayAlerts, setActiveAlerts } from 'redux-modules/alerts';
import tracker from 'helpers/googleAnalytics';
import Map from 'components/map';
import { activeDataset } from 'helpers/area';
import { getTotalActionsPending } from 'helpers/sync';

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
  let center = null;
  let areaCoordinates = null;
  let datasetSlug = null;
  let dataset = null;
  if (area) {
    dataset = activeDataset(area);
    datasetSlug = dataset.slug;
    const geostore = state.geostore.data[area.geostore];
    const areaFeatures = (geostore && geostore.geojson.features[0]) || false;
    if (areaFeatures) {
      center = new BoundingBox(areaFeatures).getCenter();
      areaCoordinates = getAreaCoordinates(areaFeatures);
    }
  }

  return {
    area: {
      dataset,
      id: area.id,
      name: area.name
    },
    center,
    datasetSlug,
    areaCoordinates,
    clusters: state.alerts.clusters,
    isConnected: state.offline.online,
    actionsPending: getTotalActionsPending(state),
    syncModalOpen: state.app.syncModalOpen,
    syncSkip: state.app.syncSkip,
    canDisplayAlerts: state.alerts.canDisplayAlerts
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
    setSyncModal: open => dispatch(setSyncModal(open)),
    setCanDisplayAlerts: canDisplay => dispatch(setCanDisplayAlerts(canDisplay))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
