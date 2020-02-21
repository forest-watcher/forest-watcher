// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getNextStep } from 'helpers/forms';
import { setSelectedAreaId } from 'redux-modules/areas';
import { shouldBeConnected } from 'helpers/app';

import { showExportReportsSuccessfulNotification } from 'redux-modules/app';

import Routes from 'components/routes';

function sortRoutes(routes) {
  let sorted = [...routes];
  sorted.sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return +1;
    return 0;
  });
  return sorted;
}

function mapStateToProps(state: State) {
  return {
    appLanguage: state.app.language,
    isConnected: shouldBeConnected(state),
    routes: sortRoutes(state.routes.previousRoutes),
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
