// @flow

import { Navigation } from 'react-native-navigation';
import Theme from 'config/theme';
import { Platform } from 'react-native';
import i18n from 'i18next';

const backButtonImage = require('assets/back.png');
const mapSettingsIcon = require('assets/map_settings.png');

export function pushMapScreen(
  componentId: string,
  passProps: { areaId?: ?string, featureId?: ?string, routeId?: ?string },
  title?: ?string = null,
  mapScreenName: string = 'ForestWatcher.Map'
) {
  const featureId = passProps.featureId ?? passProps.areaId ?? passProps.routeId ?? '';
  Navigation.push(componentId, {
    sideMenu: {
      id: 'ForestWatcher.Map', // Specify an ID so that the sidebar can easily push screens to this stack
      options: {
        topBar: {
          drawBehind: true,
          visible: false
        }
      },
      center: {
        stack: {
          children: [
            {
              component: {
                name: mapScreenName,
                options: {
                  statusBar: {
                    style: Platform.select({ android: 'light', ios: 'dark' })
                  },
                  topBar: {
                    background: {
                      color: 'transparent',
                      translucent: true
                    },
                    drawBehind: true,
                    title: {
                      color: Theme.fontColors.white,
                      text: title ?? i18n.t('dashboard.map')
                    },
                    leftButtons: [
                      {
                        id: 'backButton',
                        icon: backButtonImage,
                        color: Theme.fontColors.white
                      }
                    ],
                    rightButtons: [
                      {
                        id: 'settings',
                        icon: mapSettingsIcon
                      }
                    ]
                  }
                },
                passProps: {
                  ...passProps,
                  featureId
                }
              }
            }
          ]
        }
      },
      right: {
        component: {
          name: 'ForestWatcher.MapLayersDrawer',
          passProps: {
            ...passProps,
            featureId
          }
        }
      }
    }
  });
}

export function pushMapSetupScreen(componentId: string) {
  pushMapScreen(
    componentId,
    { featureId: 'newAreaFeatureId' },
    i18n.t('commonText.setup'),
    'ForestWatcher.SetupBoundaries'
  );
}

export function showMapWalkthrough() {
  Navigation.showModal({
    stack: {
      children: [
        {
          component: {
            id: 'ForestWatcher.MapWalkthrough',
            name: 'ForestWatcher.MapWalkthrough',
            options: {
              animations: Theme.navigationAnimations.fadeModal,
              layout: {
                backgroundColor: 'transparent',
                componentBackgroundColor: 'rgba(0,0,0,0.74)'
              },
              screenBackgroundColor: 'rgba(0,0,0,0.74)',
              modalPresentationStyle: 'overCurrentContext'
            }
          }
        }
      ]
    }
  });
}
