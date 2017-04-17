import { connect } from 'react-redux';
import { setIsConnected } from 'redux-modules/app';

import ConnectionStatus from 'components/connectionstatus';

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    setIsConnected: (isConnected) => {
      dispatch(setIsConnected(isConnected));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectionStatus);
