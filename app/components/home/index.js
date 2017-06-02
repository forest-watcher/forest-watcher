import React, { PureComponent } from 'react';
import {
  View,
  ActivityIndicator
} from 'react-native';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

class Home extends PureComponent {
  static navigatorStyle = {
    navBarHidden: true
  };

  componentDidMount() {
    this.handleStatus();
    tracker.trackScreenView('Home');
  }

  componentDidUpdate(newProps) {
    if ((this.props.loggedIn !== newProps.loggedIn)
      || (this.props.areasSynced !== newProps.areasSynced)) {
      this.handleStatus();
    }
  }

  handleStatus() {
    const { loggedIn, token, hasUserData, hasAreas, setupComplete, setLanguage, navigator, areasSynced } = this.props;
    if (loggedIn) {
      tracker.setUser(token);
      setLanguage();
      if (!hasUserData || (hasAreas && !areasSynced)) {
        return navigator.showModal({
          screen: 'ForestWatcher.Sync',
          passProps: {
            goBackDisabled: true
          }
        });
      } else if (!setupComplete) {
        return navigator.resetTo({
          screen: 'ForestWatcher.Setup',
          title: 'Set up',
          passProps: {
            goBackDisabled: true
          }
        });
      }
      return navigator.resetTo({
        screen: 'ForestWatcher.Dashboard',
        title: 'FOREST WATCHER'
      });
    }
    return navigator.resetTo({
      screen: 'ForestWatcher.Login'
    });
  }

  render() {
    return (
      <View style={[styles.mainContainer, styles.center]}>
        <ActivityIndicator
          color={Theme.colors.color1}
          style={{ height: 80 }}
          size="large"
        />
      </View>
    );
  }
}
Home.propTypes = {
  loggedIn: React.PropTypes.bool.isRequired,
  token: React.PropTypes.string,
  areasSynced: React.PropTypes.bool.isRequired,
  hasAreas: React.PropTypes.bool.isRequired,
  setupComplete: React.PropTypes.bool.isRequired,
  setLanguage: React.PropTypes.func.isRequired,
  navigator: React.PropTypes.object.isRequired,
  hasUserData: React.PropTypes.bool.isRequired
};
Home.navigationOptions = {
  header: {
    visible: false
  }
};
export default Home;
