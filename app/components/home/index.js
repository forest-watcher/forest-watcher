// @flow
import type { AppAction } from 'types/app.types';
import type { Thunk } from 'types/store.types';
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
  setAppSynced: boolean => AppAction,
  syncApp: () => Thunk<void>
};

class Home extends Component<Props> {
  static options(passProps: {}): any {
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

  async handleStatus() {
    const { loggedIn, hasAreas, isAppSynced, componentId, actionsPending, setAppSynced, syncApp } = this.props;

    if (loggedIn) {
      if (isAppSynced) {
        if (this.syncModalOpen) {
          await Navigation.dismissAllModals();
        }
        if (!hasAreas) {
          Navigation.setStackRoot(componentId, {
            component: {
              name: 'ForestWatcher.CreateArea',
              passProps: {
                goBackDisabled: true
              }
            }
          });
        } else {
          Navigation.setStackRoot(componentId, {
            component: {
              id: 'ForestWatcher.Dashboard',
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

  openModal() {
    this.setSyncModal(true);
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.Sync',
              options: {
                modalPresentationStyle: 'overCurrentContext'
              }
            }
          }
        ]
      }
    });
  }

  render(): React$Element<any> {
    return (
      <View style={[styles.mainContainer, styles.center]}>
        <ActivityIndicator color={Theme.colors.turtleGreen} style={{ height: 80 }} size="large" />
      </View>
    );
  }
}

export default Home;
