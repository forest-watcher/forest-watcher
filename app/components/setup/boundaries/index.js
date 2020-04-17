// @flow
import type { CountryArea } from 'types/setup.types';
import type { Country } from 'types/countries.types';
import type { ContextualLayer } from 'types/layers.types';

import React, { Component } from 'react';
import { Image, View } from 'react-native';

import Theme from 'config/theme';
import i18n from 'i18next';
import styles from './styles';
import { Navigation } from 'react-native-navigation';
import DrawAreas from 'containers/setup/draw-areas';

const layersIcon = require('assets/layers.png');
const backgroundImage = require('assets/map_bg_gradient.png');

type Props = {
  setSetupArea: ({ area: CountryArea, snapshot: string }) => void,
  coordinates: Array<Array<number>>,
  setupCountry: Country,
  contextualLayer: ContextualLayer,
  componentId: string
};

class SetupBoundaries extends Component<Props> {
  static options(passProps) {
    return {
      topBar: {
        background: {
          color: 'transparent',
          translucent: true
        },
        backButton: {
          color: Theme.colors.white
        },
        buttonColor: Theme.colors.white,
        drawBehind: true,
        rightButtons: [
          {
            id: 'contextual_layers',
            icon: layersIcon
          }
        ],
        title: {
          color: Theme.colors.white,
          text: i18n.t('commonText.setup')
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'contextual_layers') {
      Navigation.mergeOptions(this.props.componentId, {
        sideMenu: {
          right: {
            visible: true,
            component: {
              passProps: {
                // https://github.com/wix/react-native-navigation/issues/3635
                // Pass componentId so drawer can push screens
                componentId: this.props.componentId,
                featureId: 'newAreaFeatureId'
              }
            }
          }
        }
      });
    }
  }

  onDrawAreaFinish = (area: CountryArea, snapshot: string) => {
    this.props.setSetupArea({ area, snapshot });
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.SetupOverview'
      }
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <DrawAreas
          country={this.props.setupCountry}
          coordinates={this.props.coordinates}
          onDrawAreaFinish={this.onDrawAreaFinish}
          contextualLayer={this.props.contextualLayer}
        />
        <View pointerEvents="none" style={styles.header}>
          <Image style={styles.headerBg} source={backgroundImage} />
        </View>
      </View>
    );
  }
}

export default SetupBoundaries;
