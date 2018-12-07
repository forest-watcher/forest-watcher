// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setAreaDatasetStatus, updateDate } from 'redux-modules/areas';
import AlertSystem from 'components/settings/area-detail/alert-system';

function mapStateToProps(state: State, ownProps: { areaId: string }) {
  const { areaId } = ownProps;
  const area = state.areas.data.find(areaData => areaData.id === areaId);
  return {
    area
  };
}

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      setAreaDatasetStatus,
      updateDate
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertSystem);
