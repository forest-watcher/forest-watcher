// @flow

import { Navigation } from 'react-native-navigation';
import Theme from 'config/theme';
import i18n from 'i18next';

const backButtonImage = require('assets/back.png');
const mapSettingsIcon = require('assets/map_settings.png');
import type { Template } from 'types/reports.types';
import type { AssignmentLocation } from 'types/assignments.types';

export function pushMapScreen(
  componentId: string,
  passProps: {
    areaId?: ?string,
    featureId?: ?string,
    routeId?: ?string,
    templates?: ?Array<Template>,
    preSelectedAlerts?: ?Array<AssignmentLocation>,
    skipAvailable?: ?boolean
  },
  title: ?string = null,
  mapScreenName: string = 'ForestWatcher.Map',
  isNewArea = false // GFW-772: only show contextual layers and basemap options when creating a new area
) {
  const featureId = passProps.featureId ?? passProps.areaId ?? passProps.routeId ?? '';
  Navigation.push(componentId, {
    sideMenu: {
      id: 'ForestWatcher.Map', // Specify an ID so that the sidebar can easily push screens to this stack
      options: {
        ignoreChildOptions: true,
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
                    style: 'light',
                    backgroundColor: 'black'
                  },
                  topBar: {
                    visible: true,
                    background: {
                      color: 'transparent',
                      translucent: true
                    },
                    drawBehind: true,
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
            isNewArea,
            featureId
          }
        }
      }
    }
  });
}

export function pushMapSetupScreen(componentId: string, skipAvailable: boolean = false) {
  pushMapScreen(
    componentId,
    { featureId: 'newAreaFeatureId', skipAvailable },
    i18n.t('commonText.setup'),
    'ForestWatcher.SetupBoundaries',
    true
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
