import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ActivityIndicator
} from 'react-native';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

const Timer = require('react-native-timer');

class Home extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };

  constructor(props) {
    super(props);
    this.syncModalOpen = false;
  }

  componentDidMount() {
    this.handleStatus();
    tracker.trackScreenView('Home');
  }

  // Override shouldComponentUpdate because setLanguage passed as prop always changes
  shouldComponentUpdate(nextProps) {
    const conditions = [
      this.props.loggedIn !== nextProps.loggedIn,
      this.props.isAppSynced !== nextProps.isAppSynced,
      this.props.hasAreas !== nextProps.hasAreas,
      this.props.token !== nextProps.token,
      this.props.actionsPending !== nextProps.actionsPending
    ];
    return conditions.includes(true);
  }

  componentDidUpdate() {
    this.handleStatus();
    this.props.setLanguage();
  }

  componentWillUnmount() {
    Timer.clearImmediate('closeModal');
  }

  setSyncModal(status) {
    this.syncModalOpen = status;
  }

  handleStatus() {
    const {
      loggedIn,
      token,
      hasAreas,
      isAppSynced,
      navigator,
      actionsPending,
      setAppSynced,
      syncApp
    } = this.props;

    if (loggedIn) {
      tracker.setUser(token);
      if (isAppSynced) {
        if (!hasAreas) {
          navigator.resetTo({
            screen: 'ForestWatcher.Setup',
            passProps: {
              goBackDisabled: true
            }
          });
        } else {
          navigator.resetTo({
            screen: 'ForestWatcher.Dashboard',
            title: 'Forest Watcher'
          });
        }
      } else if (actionsPending === 0) {
        setAppSynced(true);
        Timer.setImmediate('closeModal', this.closeModal);
      } else {
        syncApp();
        if (!this.syncModalOpen) {
          this.openModal();
        }
      }
    } else {
      navigator.resetTo({
        screen: 'ForestWatcher.Walkthrough'
      });
    }
  }

  openModal = () => {
    const { navigator } = this.props;
    this.setSyncModal(true);
    navigator.showModal({
      screen: 'ForestWatcher.Sync',
      passProps: {
        goBackDisabled: true
      }
    });
  }

  closeModal = () => {
    const { navigator } = this.props;
    this.setSyncModal(false);
    navigator.dismissModal();
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
  loggedIn: PropTypes.bool.isRequired,
  token: PropTypes.string,
  isAppSynced: PropTypes.bool.isRequired,
  setLanguage: PropTypes.func.isRequired,
  navigator: PropTypes.object.isRequired,
  hasAreas: PropTypes.bool.isRequired,
  actionsPending: PropTypes.number.isRequired,
  setAppSynced: PropTypes.func.isRequired,
  syncApp: PropTypes.func.isRequired
};
Home.navigationOptions = {
  header: {
    visible: false
  }
};
export default Home;
