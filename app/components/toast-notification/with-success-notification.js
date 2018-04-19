// @flow

import type { State } from 'types/store.types';

import React from 'react';
import { connect } from 'react-redux';
import { Types } from 'components/toast-notification';
import { Navigation } from 'react-native-navigation';

// Container
function mapStateToProps(state: State) {
  return {
    syncedAreas: state.areas.synced
  };
}

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

type Props = {
  syncedAreas: boolean
};

function withSuccessNotifications(Component: any) {
  class WithNotificationsHOC extends React.Component<Props> {

    static displayName = `HOC(${getDisplayName(Component)})`;
    // $FlowFixMe
    static navigatorStyle = Component.navigatorStyle;
    // $FlowFixMe
    static navigatorButtons = Component.navigatorButtons;

    componentDidUpdate(prevProps) {
      const { syncedAreas } = this.props;
      if (syncedAreas && syncedAreas !== prevProps.syncedAreas) {
        Navigation.dismissInAppNotification();
        Navigation.showInAppNotification({
          screen: 'ForestWatcher.ToastNotification',
          passProps: {
            type: Types.success,
            text: 'Your alerts are up to date'
          },
          autoDismissTimerSec: 2
        });
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

export default withSuccessNotifications;
