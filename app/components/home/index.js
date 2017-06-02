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
    const { loggedIn, token, hasAreas, setupComplete, setLanguage, navigator, areasSynced } = this.props;
    if (loggedIn) {
      tracker.setUser(token);
      setLanguage();

      if (hasAreas) {
        if (areasSynced) {
          navigator.resetTo({
            screen: 'ForestWatcher.Dashboard',
            title: 'FOREST WATCHER'
          });
        }
      } else if (!setupComplete) {
        navigator.resetTo({
          screen: 'ForestWatcher.Setup',
          title: 'Set up',
          passProps: {
            goBackDisabled: true
          }
        });
      }
      navigator.resetTo({
        screen: 'ForestWatcher.Dashboard',
        title: 'FOREST WATCHER'
      });
    } else {
      navigator.resetTo({
        screen: 'ForestWatcher.Login'
      });
    }
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
  navigator: React.PropTypes.object.isRequired
};
Home.navigationOptions = {
  header: {
    visible: false
  }
};
export default Home;
