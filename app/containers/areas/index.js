// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';
import RNShare from 'react-native-share';
import { setSelectedAreaId } from 'redux-modules/areas';
import { setAreaDownloadTooltipSeen, showNotConnectedNotification } from 'redux-modules/app';

import Areas from 'components/areas';
import exportBundle from 'helpers/sharing/exportBundle';
import { initialiseAreaLayerSettings } from 'redux-modules/layerSettings';
import exportBundleFromRedux from 'helpers/sharing/exportBundleFromRedux';
import shareBundle from 'helpers/sharing/shareBundle';

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
    exportAreas: async (ids: Array<string>) => {
      const outputPath = await dispatch(
        exportBundleFromRedux({
          areaIds: ids
        })
      );
      await shareBundle(outputPath);
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
