import { connect } from 'react-redux';
import Header from 'components/common/header';

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    navigate: (routeName) => {
      navigation.navigate(routeName);
    },
    navigateBack: () => {
      navigation.goBack();
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
