import { connect } from 'react-redux';
import { createReport } from 'redux-modules/reports';
import Map from 'components/map';

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    createReport: (name, position) => {
      dispatch(createReport(name, position));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
