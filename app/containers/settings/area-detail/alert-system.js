import { connect } from 'react-redux';
import { updateArea } from 'redux-modules/areas';
import AlertSystem from 'components/settings/area-detail/alert-system';

const alerts = [
  { name: 'GLAD', value: true, options: [{ name: 'cache', type: 'radio', value: false }, { name: 'timeframe', type: 'timeframe', value: ['01/01/2016', '01/01/2017'] }] },
  { name: 'VIIRS', value: false, options: [{ name: 'cache', type: 'radio', value: false }, { name: 'timeframe', type: 'timeframe', value: ['01/01/2016', '01/01/2017'] }] }
];

function mapStateToProps(state, { areaId }) {
  const area = state.areas.data.find((areaData) => (areaData.id === areaId));
  return {
    area,
    alerts
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateArea: (area) => {
      dispatch(updateArea(area));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertSystem);
