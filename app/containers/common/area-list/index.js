// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';

import AreaList from 'components/common/area-list';

// TODO: remove this
function mapStateToProps(state: State) {
  return {
    areas: state.areas.data
  };
}

type PassedProps = ComponentProps<{}, typeof mapStateToProps, *>;
export default connect<PassedProps, {}, _, _, State, Dispatch>(
  mapStateToProps,
  null
)(AreaList);
