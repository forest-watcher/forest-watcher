// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';
import RNShare from 'react-native-share';
import { setSelectedAreaId } from 'redux-modules/areas';
import { setAreaDownloadTooltipSeen, showNotConnectedNotification } from 'redux-modules/app';

import Areas from 'components/areas';
import exportBundle from 'helpers/sharing/exportBundle';
import { initialiseAreaLayerSettings } from 'redux-modules/layerSettings';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State, props: OwnProps) {
  return {
    areaDownloadTooltipSeen: state.app.areaDownloadTooltipSeen,
    areas: state.areas.data,
    offlineMode: state.app.offlineMode
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    exportAreas: (ids: Array<string>) => {
      // todo: turn this into a proper action creator
      dispatch(async (dispatch, getState) => {
        const state = getState();
        const outputFile = await exportBundle(
          {
            areaIds: ids,
            reportIds: []
          },
          state
        );
        await RNShare.open({
          saveToFiles: true,
          url: `file://${outputFile}`
        });
      });
    },
    initialiseAreaLayerSettings: (featureId: string, areaId: string) => {
      dispatch(initialiseAreaLayerSettings(featureId, areaId));
    },
    setAreaDownloadTooltipSeen: (seen: boolean) => {
      dispatch(setAreaDownloadTooltipSeen(seen));
    },
    setSelectedAreaId: (id: string) => {
      dispatch(setSelectedAreaId(id));
    },
    showNotConnectedNotification: () => {
      dispatch(showNotConnectedNotification());
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Areas);
