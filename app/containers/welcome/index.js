// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Welcome from 'components/welcome';
import { setWelcomeScreenSeen } from 'redux-modules/app';

function mapStateToProps(state: State) {
  return {
    isAppUpdate: state.app.isUpdate
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators(
    {
      setWelcomeScreenSeen
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Welcome);
