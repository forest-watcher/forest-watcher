// @flow

import type { State } from 'types/store.types';

import React from 'react';
import { connect } from 'react-redux';
import { Types, showNotification } from 'components/toast-notification';
import I18n from 'locales';

// Container
function mapStateToProps(state: State) {
  return {
    syncedAreas: (state.areas.synced || state.layers.synced || state.alerts.queue.length > 0),
    errorAreaCreation: state.setup.error
  };
}

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

type Props = {
  syncedAreas: boolean,
  errorAreaCreation: boolean,
};

function withNotifications(Component: any) {
  class WithNotificationsHOC extends React.Component<Props> {

    static displayName = `HOC(${getDisplayName(Component)})`;
    // $FlowFixMe
    static navigatorStyle = Component.navigatorStyle;
    // $FlowFixMe
    static navigatorButtons = Component.navigatorButtons;

    componentDidUpdate(prevProps) {
      const { syncedAreas, errorAreaCreation } = this.props;
      if (syncedAreas && syncedAreas !== prevProps.syncedAreas) {
        const notification = {
          type: Types.success,
          text: I18n.t('sync.alertsUpdated')
        };
        showNotification(notification);
      }
      if (errorAreaCreation && errorAreaCreation !== prevProps.errorAreaCreation) {
        const notification = {
          type: Types.error,
          text: I18n.t('sync.errorCreatingArea')
        };
        showNotification(notification, true, 15);
      }
    }

    render() {
      const { ...props } = this.props;
      return (
        <Component {...props} />
      );
    }
  }

  return connect(mapStateToProps)(WithNotificationsHOC);
}

export default withNotifications;
