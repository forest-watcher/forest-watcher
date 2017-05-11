import { connect } from 'react-redux';
import Dashboard from 'components/dashboard';
import { createReport } from 'redux-modules/reports';

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    navigate: (routeName, params) => {
      navigation.navigate(routeName, params);
    },
    createReport: (name, position) => {
      dispatch(createReport(name, position));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
