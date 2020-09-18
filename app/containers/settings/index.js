// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';
import { isUnsafeLogout } from 'helpers/app';
import { logout } from 'redux-modules/user';
import { setOfflineMode } from 'redux-modules/app';

import Settings from 'components/settings';
import { trackSharedContent } from 'helpers/analytics';
import { exportWholeAppBundleFromRedux } from 'helpers/sharing/exportBundleFromRedux';
import shareBundle from 'helpers/sharing/shareBundle';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    version: state.app.version,
    isUnsafeLogout: isUnsafeLogout(state),
    user: state.user.data,
    loggedIn: state.user.loggedIn,
    offlineMode: state.app.offlineMode
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    logout: (socialNetworkFallback: ?string) => {
      dispatch(logout(socialNetworkFallback));
    },
    setOfflineMode: (offlineMode: boolean) => {
      dispatch(setOfflineMode(offlineMode));
    },
    shareAppData: async (): Promise<string> => {
      const outputPath = await dispatch(exportWholeAppBundleFromRedux());
      trackSharedContent('bundle');
      await shareBundle(outputPath);
      return outputPath;
    }
  };
};

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
