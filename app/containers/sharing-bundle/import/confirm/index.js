// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { ImportBundleRequest, UnpackedSharingBundle } from 'types/sharing.types';

import { connect } from 'react-redux';
import ImportSharingBundleConfirmScreen from 'components/sharing-bundle/import/confirm';
import deleteStagedBundle from 'helpers/sharing/deleteStagedBundle';
import { importStagedBundle } from 'helpers/sharing/importBundle';

type OwnProps = {|
  bundle: UnpackedSharingBundle,
  componentId: string,
  importRequest: ImportBundleRequest,
  stepNumber: ?number
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps) {
  return {
    importBundle: async () => {
      await importStagedBundle(ownProps.bundle, ownProps.importRequest, dispatch);
      deleteStagedBundle(ownProps.bundle);
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(ImportSharingBundleConfirmScreen);
