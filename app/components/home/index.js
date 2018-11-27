// @flow

import React, { Component } from 'react';
import {
  View,
  ActivityIndicator
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

type Props = {
  loggedIn: boolean,
  token: string,
  isAppSynced: boolean,
  componentId: string,
  hasAreas: boolean,
  actionsPending: number,
  setAppSynced: boolean => void,
  syncApp: () => void
};

class Home extends Component<Props> {

  static options(passProps) {
    return {
      topBar: {
        visible: false
      }
    };
  }

  syncModalOpen: boolean = false;

  componentDidMount() {
    this.handleStatus();
  }

  componentDidUpdate() {
    this.handleStatus();
  }

  handleStatus() {
    const {
      loggedIn,
      token,
      hasAreas,
      isAppSynced,
      componentId,
      actionsPending,
      setAppSynced,
      syncApp
    } = this.props;

    if (loggedIn) {
      tracker.setUser(token);
      if (isAppSynced) {
        if (!hasAreas) {
          Navigation.setStackRoot(componentId, {
            component: {
              name: 'ForestWatcher.Setup',
              passProps: {
                goBackDisabled: true,
                closeModal: true
              }
            }
          });
        } else {
          Navigation.setStackRoot(componentId, {
            component: {
              name: 'ForestWatcher.Dashboard',
              passProps: {
                closeModal: true
              }
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
      Navigation.setStackRoot(componentId, {
        component: {
          name: 'ForestWatcher.Walkthrough'
        }
      });
    }
  }

  setSyncModal(status: boolean) {
    this.syncModalOpen = status;
  }

  openModal = () => {
    this.setSyncModal(true);
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.Sync',
              passProps: {
                goBackDisabled: true
              }
            }
          }
        ]
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
