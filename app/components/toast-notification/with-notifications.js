// @flow

import type { State } from 'types/store.types';

import React from 'react';
import { connect } from 'react-redux';
import { Types } from 'components/toast-notification';
import { Navigation } from 'react-native-navigation';

// Container
function mapStateToProps(state: State) {
  return {
    syncedAreas: state.areas.synced,
    errorAreaCreation: state.setup.error
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

    static displayName = `HOC(${getDisplayName(Component)})`;
    // $FlowFixMe
    static navigatorStyle = Component.navigatorStyle;
    // $FlowFixMe
    static navigatorButtons = Component.navigatorButtons;

    componentDidUpdate(prevProps) {
      const { syncedAreas, errorAreaCreation } = this.props;
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
      if (errorAreaCreation && errorAreaCreation !== prevProps.errorAreaCreation) {
        Navigation.dismissInAppNotification();
        Navigation.showInAppNotification({
          screen: 'ForestWatcher.ToastNotification',
          passProps: {
            type: Types.error,
            text: 'There was an error creating your area'
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

export default withNotifications;
