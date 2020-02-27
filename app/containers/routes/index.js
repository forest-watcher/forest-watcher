// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setSelectedAreaId } from 'redux-modules/areas';
import { shouldBeConnected } from 'helpers/app';

import { showExportReportsSuccessfulNotification } from 'redux-modules/app';

import Routes from 'components/routes';

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
