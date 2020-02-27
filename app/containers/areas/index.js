// @flow
import type { Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';
import { setSelectedAreaId } from 'redux-modules/areas';
import { showNotConnectedNotification } from 'redux-modules/app';

import Areas from 'components/areas';
import exportBundle from 'helpers/sharing/exportBundle';

function mapStateToProps(state: State) {
  return {
    areas: state.areas.data,
    offlineMode: state.app.offlineMode
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    exportAreas: (ids: Array<string>) => {
      // todo: turn this into a proper action creator
      dispatch((dispatch, getState) => {
        const state = getState();
        exportBundle(
          {
            areaIds: ids,
            reportIds: []
          },
          state
        );
      });
    },
    setSelectedAreaId: (id: string) => {
      dispatch(setSelectedAreaId(id));
    },
    showNotConnectedNotification: () => {
      dispatch(showNotConnectedNotification());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Areas);
