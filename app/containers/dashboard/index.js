import { connect } from 'react-redux';
import Dashboard from 'components/dashboard';

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    navigate: (routeName, params) => {
      navigation.navigate(routeName, params);
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
