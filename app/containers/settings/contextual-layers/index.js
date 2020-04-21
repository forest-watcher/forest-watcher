// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';

import ContextualLayers from 'components/settings/contextual-layers';
import exportBundleFromRedux from 'helpers/sharing/exportBundleFromRedux';
import shareBundle from 'helpers/sharing/shareBundle';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    baseApiLayers: state.layers.data || [],
    importedLayers: state.layers.imported
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    exportLayers: async (ids: Array<string>) => {
      const outputPath = await dispatch(
        exportBundleFromRedux({
          layerIds: ids
        })
      );
      await shareBundle(outputPath);
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(ContextualLayers);
