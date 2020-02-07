// @flow
import React, { Component } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';

import type { Area } from 'types/areas.types';

import ActionButton from 'components/common/action-button';
import AreaList from 'containers/common/area-list';
import BottomTray from 'components/common/bottom-tray';
import debounceUI from 'helpers/debounceUI';

import { launchAppRoot } from 'main';
import i18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

const plusIcon = require('assets/add.png');

type Props = {
  areas: Array<Area>,
  componentId: string,
  setSelectedAreaId: () => void,
  showNotConnectedNotification: () => void,
  offlineMode: boolean
};

class Areas extends Component<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('areas.title')
        },
        rightButtons: [
          {
            id: 'addArea',
            icon: plusIcon
          }
        ]
      }
    };
  }

  constructor(props) {
    super(props);
    this.navigationEventListener = Navigation.events().bindComponent(this);
  }

  componentDidMount() {
    tracker.trackScreenView('Areas');
  }

  componentWillUnmount() {
    // Not mandatory
    if (this.navigationEventListener) {
      this.navigationEventListener.remove();
    }
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'addArea') {
      this.onPressAddArea();
    }
  }

  onAreaSettingsPress = debounceUI((areaId: string, name: string) => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.AreaDetail',
        passProps: {
          id: areaId
        },
        options: {
          topBar: {
            title: {
              text: name
            }
          }
        }
      }
    });
  });

  onAreaPress = debounceUI((areaId: string, name: string) => {
     if (areaId) {
      this.props.setSelectedAreaId(areaId);
      Navigation.push(this.props.componentId, {
        component: {
          name: 'ForestWatcher.Map'
        }
      });
    }
  });

  onPressAddArea = debounceUI(() => {
    const { offlineMode } = this.props;

    if (offlineMode) {
      this.props.showNotConnectedNotification();
      return;
    }

    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.SetupCountry'
      }
    });
  });

  render() {
    const { areas } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {areas && areas.length ? (
            <View style={styles.areas}>
              <Text style={styles.label}>{i18n.t('areas.myAreas')}</Text>
              <AreaList 
                onAreaPress={(areaId, name) => this.onAreaPress(areaId, name)} 
                onAreaSettingsPress={(areaId, name) => this.onAreaSettingsPress(areaId, name)}
              />
            </View>
          ) : null}
        </ScrollView>
        <BottomTray>
          <ActionButton
            noIcon
            text={i18n.t('areas.share')}
          />
        </BottomTray>
      </View>
    );
  }
}

export default Areas;
