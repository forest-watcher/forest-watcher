// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setSelectedAreaId } from 'redux-modules/areas';
import { showNotConnectedNotification } from 'redux-modules/app';

import Areas from 'components/areas';

function mapStateToProps(state: State) {
  return {
    areas: state.areas.data,
    offlineMode: state.app.offlineMode
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators(
    {
      setSelectedAreaId,
      showNotConnectedNotification
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Areas);
