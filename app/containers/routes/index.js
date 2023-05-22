// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';

import Routes from 'components/routes';
import { initialiseAreaLayerSettings } from 'redux-modules/layerSettings';
import { trackSharedContent } from 'helpers/analytics';
import exportBundleFromRedux from 'helpers/sharing/exportBundleFromRedux';
import shareBundle from 'helpers/sharing/shareBundle';
import type { Route } from '../../types/routes.types';
import { uploadRoutes } from '../../redux-modules/routes';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    routes: state.routes.previousRoutes,
    syncing: state.routes.syncing
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    exportRoutes: async (ids: Array<string>) => {
      const outputPath = await dispatch(
        exportBundleFromRedux({
          routeIds: ids
        })
      );
      trackSharedContent('route');
      await shareBundle(outputPath);
    },
    syncRoutes: (routes: Array<Route>) => {
      dispatch(uploadRoutes(routes));
    },
    initialiseAreaLayerSettings: (featureId: string, areaId: string) => {
      dispatch(initialiseAreaLayerSettings(featureId, areaId));
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Routes);
