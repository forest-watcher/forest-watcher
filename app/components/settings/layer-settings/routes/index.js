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
import moment from 'moment';
import { formatDistance, getDistanceOfPolyline } from 'helpers/map';

const screenDimensions = Dimensions.get('screen');

const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');

type RoutesLayerSettingsType = {
  showAll: boolean,
  layerIsActive: boolean,
  activeRouteIds: Array<string>
};

type Props = {
  componentId: string,
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

  onPressManageRoutes = () => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Routes'
      }
    });
  };

  renderRoutes = (routes, headingLocalisation) => {
    return (
      <View>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{i18n.t(headingLocalisation)}</Text>
        </View>
        {routes.map(route => {
          const { showAll, activeRouteIds } = this.props.routesLayerSettings;
          const alwaysActive = route.id === this.props.featureId;
          const selected = showAll || alwaysActive ? true : activeRouteIds.includes(route.id);
          const date = moment(route.endDate).format('ll');
          const routeDistance = getDistanceOfPolyline(route.locations);
          const distance = formatDistance(routeDistance, 1, false);
          return (
            <ActionsRow
              style={styles.rowContent}
              onPress={() => this.toggleRouteSelected(route.id)}
              key={route.id}
              renderCustomImage={() => (
                <RoutePreviewImage
                  aspectRatio={0.3}
                  width={screenDimensions.width}
                  style={{ flex: 1, maxWidth: 109, alignSelf: 'stretch' }}
                  route={route}
                />
              )}
            >
              <View>
                <Text style={styles.title}>{route.name}</Text>
                <Text style={styles.rowLabel}>{`${date}, ${distance}`}</Text>
              </View>
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
          <ActionButton
            onPress={this.onPressManageRoutes}
            text={i18n.t('map.layerSettings.manageRoutes')}
            transparent
            noIcon
          />
        </BottomTray>
      </View>
    );
  }
}

export default RoutesLayerSettings;
