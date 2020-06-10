// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { ImportBundleRequest } from 'types/sharing.types';
import type { SharingBundleCustomImportFlowState } from 'components/sharing-bundle/import/createCustomImportFlow';

import { connect } from 'react-redux';
import ImportSharingBundleConfirmScreen from 'components/sharing-bundle/import/confirm';
import deleteStagedBundle from 'helpers/sharing/deleteStagedBundle';
import { importStagedBundle } from 'helpers/sharing/importBundle';
import { SHARING_BUNDLE_IMPORTED } from 'redux-modules/app';
import summariseBundleContents from 'helpers/sharing/summariseBundleContents';

type OwnProps = {|
  componentId: string,
  formState: SharingBundleCustomImportFlowState,
  importRequest: ImportBundleRequest
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps) {
  return {
    importBundle: async () => {
      const bundle = ownProps.formState.bundle;
      await importStagedBundle(bundle, ownProps.importRequest, dispatch);

      let summary = "";

      try {
        const summaryParts = summariseBundleContents(bundle.data, ownProps.importRequest);
        summary = summaryParts.join(", ");
      } catch (err) {
        // ignore
        Sentry.logException(err);
      }

      dispatch({
        type: SHARING_BUNDLE_IMPORTED,
        payload: {
          summary: summary
        }
      });

      deleteStagedBundle(bundle);
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(ImportSharingBundleConfirmScreen);
