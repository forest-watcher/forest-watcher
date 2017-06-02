import React, { Component } from 'react';
import {
  View,
  ActivityIndicator
} from 'react-native';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

class Home extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };

  componentDidMount() {
    this.handleStatus();
    tracker.trackScreenView('Home');
  }

  componentWillReceiveProps(newProps) {
    if ((this.props.user.loggedIn !== newProps.user.loggedIn)
      || (this.props.areasSynced !== newProps.areasSynced)) {
      this.props = newProps;
      this.handleStatus();
    }
  }

  handleStatus() {
    const { user, hasAreas, setupComplete, getUser, setLanguage, navigator, areasSynced } = this.props;
    if (user.loggedIn) {
      tracker.setUser(user.token);
      // if (!loggedIn) {
      //   this.props.setLoginStatus({
      //     loggedIn: true,
      //     token
      //   });
      // }

      getUser();
      setLanguage();

      if (hasAreas || setupComplete) {
        if (areasSynced) {
          navigator.resetTo({
            screen: 'ForestWatcher.Dashboard',
            title: 'FOREST WATCHER'
          });
        }
      } else {
        navigator.resetTo({
          screen: 'ForestWatcher.Setup',
          title: 'Set up',
          passProps: {
            goBackDisabled: true
          }
        });
      }
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
  user: React.PropTypes.shape({
    loggedIn: React.PropTypes.bool.isRequired,
    token: React.PropTypes.string
  }).isRequired,
  areasSynced: React.PropTypes.bool.isRequired,
  hasAreas: React.PropTypes.bool.isRequired,
  setupComplete: React.PropTypes.bool.isRequired,
  getUser: React.PropTypes.func.isRequired,
  setLanguage: React.PropTypes.func.isRequired,
  navigator: React.PropTypes.object.isRequired
};
Home.navigationOptions = {
  header: {
    visible: false
  }
};
export default Home;
