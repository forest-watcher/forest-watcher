// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setGladAlertsTimeFrame, setViirsAlertsTimeFrame, toggleGladAlerts, toggleViirsAlerts } from 'redux-modules/layerSettings';
import AlertLayerSettings from 'components/settings/layer-settings/alerts';

function mapStateToProps(state: State) {
  return {
    alertLayerSettings: state.layerSettings.alerts
  };
}

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      toggleGladAlerts,
      toggleViirsAlerts,
      setGladAlertsTimeFrame,
      setViirsAlertsTimeFrame
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertLayerSettings);
