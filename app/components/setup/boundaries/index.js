// @flow
import type { CountryArea } from 'types/setup.types';
import type { Country } from 'types/countries.types';
import type { ContextualLayer } from 'types/layers.types';

import React, { Component } from 'react';
import { Image, View } from 'react-native';

import DrawAreas from 'components/setup/draw-areas';
import Theme from 'config/theme';
import i18n from 'locales';
import styles from './styles';
import { Navigation } from 'react-native-navigation';

const layersIcon = require('assets/layers.png');
const backgroundImage = require('assets/map_bg_gradient.png');

type Props = {
  setSetupArea: ({ area: CountryArea, snapshot: string }) => void,
  coordinates: Array<Array<number>>,
  setupCountry: Country,
  contextualLayer: ContextualLayer
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
          color: Theme.colors.color5
        },
        buttonColor: Theme.colors.color5,
        drawBehind: true,
        rightButtons: [
          {
            id: 'contextual_layers',
            icon: layersIcon
          }
        ],
        title: {
          color: Theme.colors.color5,
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
            visible: true
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
