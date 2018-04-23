// @flow

import React, { Component } from 'react';
import {
  View,
  ActivityIndicator
} from 'react-native';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

type Props = {
  loggedIn: boolean,
  token: string,
  isAppSynced: boolean,
  setLanguage: () => void,
  navigator: Object,
  hasAreas: boolean,
  actionsPending: number,
  setAppSynced: boolean => void,
  syncApp: () => void
};

class Home extends Component<Props> {

  static navigatorStyle = {
    navBarHidden: true
  };

  static navigationOptions = {
    header: {
      visible: false
    }
  };

  syncModalOpen: boolean = false;

  componentDidMount() {
    this.handleStatus();
    tracker.trackScreenView('Home');
  }

  // Override shouldComponentUpdate because setLanguage passed as prop always changes
  shouldComponentUpdate(nextProps: Props) {
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
            title: 'Forest Watcher',
            passProps: {
              closeModal: true
            }
          });
        }
      } else if (actionsPending === 0) {
        setAppSynced(true);
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

  setSyncModal(status: boolean) {
    this.syncModalOpen = status;
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

export default Home;
