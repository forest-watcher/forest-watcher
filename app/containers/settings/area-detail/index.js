// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateArea, deleteArea } from 'redux-modules/areas';
import AreaDetail from 'components/settings/area-detail';

function mapStateToProps(state: State, { id }) {
  const area = state.areas.data.find((areaData) => (areaData.id === id));
  return {
    area,
    isConnected: state.offline.online
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators({
    updateArea,
    deleteArea
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AreaDetail);
