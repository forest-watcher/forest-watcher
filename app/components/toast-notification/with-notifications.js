// @flow

import type { State } from 'types/store.types';

import React from 'react';
import { connect } from 'react-redux';
import { Types, showNotification } from 'components/toast-notification';
import I18n from 'locales';

// Container
function mapStateToProps(state: State) {
  return {
    // TODO: move this to the notifications saga when the entire get areas saga has finished
    syncedAreas: (state.areas.synced && state.layers.synced && state.alerts.queue.length === 0)
  };
}

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

type Props = {
  syncedAreas: boolean
};

function withNotifications(Component: any) {
  class WithNotificationsHOC extends React.Component<Props> {

    static displayName = `withNotificationsHOC(${getDisplayName(Component)})`;
    // $FlowFixMe
    static navigatorStyle = Component.navigatorStyle;
    // $FlowFixMe
    static navigatorButtons = Component.navigatorButtons;

    componentDidUpdate(prevProps) {
      const { syncedAreas } = this.props;
      if (syncedAreas && syncedAreas !== prevProps.syncedAreas) {
        const notification = {
          type: Types.success,
          text: I18n.t('sync.alertsUpdated')
        };
        showNotification(notification);
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
