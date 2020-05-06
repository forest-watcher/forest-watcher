// @flow

import React, { Component } from 'react';
import { View, ActivityIndicator, InteractionManager } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Theme from 'config/theme';
import styles from './styles';

type Props = {
  loggedIn: boolean,
  isAppSynced: boolean,
  componentId: string,
  hasAreas: boolean,
  actionsPending: number,
  setAppSynced: boolean => void,
  syncApp: () => void
};

class Home extends Component<Props> {
  static options(passProps: {}) {
    return {
      topBar: {
        drawBehind: true,
        visible: false
      }
    };
  }

  syncModalOpen: boolean = false;

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.handleStatus();
    });
  }

  componentDidUpdate() {
    InteractionManager.runAfterInteractions(() => {
      this.handleStatus();
    });
  }

  handleStatus() {
    const { loggedIn, hasAreas, isAppSynced, componentId, actionsPending, setAppSynced, syncApp } = this.props;

    if (loggedIn) {
      if (isAppSynced) {
        if (this.syncModalOpen) {
          Navigation.dismissAllModals();
        }
        if (!hasAreas) {
          Navigation.setStackRoot(componentId, {
            component: {
              name: 'ForestWatcher.SetupCountry',
              passProps: {
                goBackDisabled: true
              }
            }
          });
        } else {
          Navigation.setStackRoot(componentId, {
            component: {
              name: 'ForestWatcher.Dashboard'
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
          name: 'ForestWatcher.Login'
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
  };

  render() {
    return (
      <View style={[styles.mainContainer, styles.center]}>
        <ActivityIndicator color={Theme.colors.turtleGreen} style={{ height: 80 }} size="large" />
      </View>
    );
  }
}

export default Home;
