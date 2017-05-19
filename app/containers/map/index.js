import { connect } from 'react-redux';
import { createReport } from 'redux-modules/reports';
import tracker from 'helpers/googleAnalytics';
import Map from 'components/map';

function mapStateToProps(state) {
  const areas = state.areas.data.map((area) => (
    {
      id: area.id,
      name: area.attributes.name,
      geostoreId: area.attributes.geostore,
      datasets: area.datasets
    }
    ));
  return {
    areas,
    isConnected: state.app.isConnected,
    geostores: state.geostore.data
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
