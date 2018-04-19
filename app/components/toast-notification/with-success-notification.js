import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Types } from 'components/toast-notification';
import { Navigation } from 'react-native-navigation';

// Container
function mapStateToProps(state) {
  return {
    syncedAreas: state.areas.synced
  };
}

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

function withSuccessNotifications(Component) {
  class WithNotificationsHOC extends React.Component {
    static propTypes = {
      syncedAreas: PropTypes.bool.isRequired
    };

    static displayName = `HOC(${getDisplayName(Component)})`;
    static navigatorStyle = Component.navigatorStyle;
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
