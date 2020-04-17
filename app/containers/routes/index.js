// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setSelectedAreaId } from 'redux-modules/areas';
import { shouldBeConnected } from 'helpers/app';

import { showExportReportsSuccessfulNotification } from 'redux-modules/app';

import Routes from 'components/routes';
import { initialiseAreaLayerSettings } from 'redux-modules/layerSettings';

function mapStateToProps(state: State) {
  return {
    appLanguage: state.app.language,
    isConnected: shouldBeConnected(state),
    routes: state.routes.previousRoutes
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators(
    {
      initialiseAreaLayerSettings,
      setSelectedAreaId,
      showExportReportsSuccessfulNotification
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Routes);
