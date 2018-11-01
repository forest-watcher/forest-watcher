// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';

import AreaList from 'components/common/area-list';

// TODO: remove this
function mapStateToProps(state: State) {
  return {
    areas: state.areas.data
  };
}

export default connect(
  mapStateToProps,
  null
)(AreaList);
