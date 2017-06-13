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

  // Override shouldComponentUpdate because setLanguage passed as prop always changes
  shouldComponentUpdate(nextProps) {
    const conditions = [
      this.props.loggedIn !== nextProps.loggedIn,
      this.props.readyState !== nextProps.readyState,
      this.props.hasAreas !== nextProps.hasAreas,
      this.props.token !== nextProps.token
    ];
    return conditions.includes(true);
  }

  componentDidUpdate() {
    this.handleStatus();
  }

  handleStatus() {
    const { loggedIn, token, hasAreas, readyState, setLanguage, navigator, syncModalOpen } = this.props;
    setLanguage();
    if (loggedIn) {
      tracker.setUser(token);
      if (!readyState && !syncModalOpen) {
        this.openModal();
      } else if (readyState) {
        if (!hasAreas) {
          navigator.resetTo({
            screen: 'ForestWatcher.Setup',
            title: 'Set up',
            passProps: {
              goBackDisabled: true
            }
          });
        } else {
          navigator.resetTo({
            screen: 'ForestWatcher.Dashboard',
            title: 'FOREST WATCHER'
          });
        }
      }
    } else { // eslint-disable-line
      navigator.resetTo({
        screen: 'ForestWatcher.Login'
      });
    }
  }

  openModal = () => {
    const { navigator, setSyncModal } = this.props;
    setSyncModal(true);
    navigator.showModal({
      screen: 'ForestWatcher.Sync',
      passProps: {
        goBackDisabled: true
      }
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
  readyState: React.PropTypes.bool.isRequired,
  setLanguage: React.PropTypes.func.isRequired,
  navigator: React.PropTypes.object.isRequired,
  hasAreas: React.PropTypes.bool.isRequired,
  syncModalOpen: React.PropTypes.bool.isRequired,
  setSyncModal: React.PropTypes.func.isRequired
};
Home.navigationOptions = {
  header: {
    visible: false
  }
};
export default Home;
