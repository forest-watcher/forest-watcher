// @flow
import { Navigation } from 'react-native-navigation';
import Theme from 'config/theme';

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
