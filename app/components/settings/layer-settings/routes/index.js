// @flow

import React, { PureComponent } from 'react';
import { Image, View, ScrollView, Text, Dimensions } from 'react-native';
import styles from './styles';
import i18n from 'i18next';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import { Navigation } from 'react-native-navigation';
import type { Route } from 'types/routes.types';
import ActionsRow from 'components/common/actions-row';
import RoutePreviewImage from 'components/routes/preview-image';

const screenDimensions = Dimensions.get('screen');

const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');

type RoutesLayerSettingsType = {
  layerIsActive: boolean,
  activeRouteIds: Array<string>
};

type Props = {
  featureId: string,
  myRoutes: Array<Route>,
  importedRoutes: Array<Route>,
  routesLayerSettings: RoutesLayerSettingsType,
  toggleRouteSelected: (string, string) => void,
  deselectAllRoutes: string => void,
  selectAllRoutes: string => void,
  getAllRoutesWithIds: (Array<string>) => Array<Route>
};

class RoutesLayerSettings extends PureComponent<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('map.layerSettings.routes')
        },
        rightButtons: [
          {
            id: 'clear',
            text: i18n.t('commonText.clear'),
            ...styles.topBarTextButton
          }
        ]
      }
    };
  }

  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'clear') {
      this.deselectAllRoutes();
    }
  }

  toggleRouteSelected = (routeId: string) => {
    this.props.toggleRouteSelected(this.props.featureId, routeId);
  };

  deselectAllRoutes = () => {
    this.props.deselectAllRoutes(this.props.featureId);
  };

  selectAllRoutes = () => {
    this.props.selectAllRoutes(this.props.featureId);
  };

  renderRoutes = (routes, headingLocalisation) => {
    return (
      <View>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{i18n.t(headingLocalisation)}</Text>
        </View>
        {routes.map(route => {
          const selected = this.props.routesLayerSettings.activeRouteIds.includes(route.id);
          return (
            <ActionsRow
              style={styles.rowContent}
              onPress={() => this.toggleRouteSelected(route.id)}
              key={route.id}
              renderCustomImage={() => (
                <RoutePreviewImage
                  aspectRatio={0.5}
                  width={screenDimensions.width}
                  style={{ flex: 1, width: 98, height: 98, alignSelf: 'stretch' }}
                  route={route}
                />
              )}
            >
              <Text style={styles.rowLabel}>{route.name}</Text>
              <Image source={selected ? checkboxOn : checkboxOff} />
            </ActionsRow>
          );
        })}
      </View>
    );
  };

  render() {
    const { myRoutes, importedRoutes } = this.props;
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {myRoutes.length > 0 && this.renderRoutes(myRoutes, 'map.layerSettings.myRoutes')}
          {importedRoutes.length > 0 && this.renderRoutes(importedRoutes, 'map.layerSettings.importedRoutes')}
        </ScrollView>
        <BottomTray requiresSafeAreaView>
          <ActionButton onPress={() => {}} text={i18n.t('map.layerSettings.manageRoutes')} transparent noIcon />
        </BottomTray>
      </View>
    );
  }
}

export default RoutesLayerSettings;
