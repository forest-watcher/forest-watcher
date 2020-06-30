// @flow
import { Navigation } from 'react-native-navigation';
import Theme from 'config/theme';
import i18n from 'i18next';
import { Platform } from 'react-native';

const backButtonImage = require('assets/back.png');
const mapSettingsIcon = require('assets/map_settings.png');

/**
  Presents the information screen modally with default animation
  @param {Object} passProps - The props to pass into the information screen
  @param {string} passProps.title - The title to display on the screen
  @param {string} passProps.body - The body to display in the screen
 */
export function presentInformationModal(passProps: { title: string, body: string }) {
  Navigation.showModal({
    stack: {
      children: [
        {
          component: {
            name: 'ForestWatcher.Information',
            passProps,
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
  pushMapScreen(componentId, { featureId: 'newAreaFeatureId' }, i18n.t('commonText.setup'), 'ForestWatcher.SetupBoundaries');
}

export function showWelcomeScreen() {
  Navigation.showModal({
    stack: {
      children: [
        {
          component: {
            name: 'ForestWatcher.Welcome',
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

export function showMapWalkthrough() {
  Navigation.showModal({
    stack: {
      children: [
        {
          component: {
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

export function showFAQSection(parentComponentId: string, title: string) {
  Navigation.push(parentComponentId, {
    component: {
      name: 'ForestWatcher.FaqCategories',
      options: {
        topBar: {
          title: {
            text: title
          }
        }
      }
    }
  });
}

export function launchAppRoot(screen: string) {
  return Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              id: 'ForestWatcher.Dashboard',
              name: screen
            }
          }
        ]
      }
    }
  });
}
