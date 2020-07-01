// @flow
import type { CountryArea, SetupAction } from 'types/setup.types';
import type { Country } from 'types/countries.types';

import React, { Component } from 'react';
import { Image, View } from 'react-native';

import styles from './styles';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';
import DrawAreas from 'containers/setup/draw-areas';

const backgroundImage = require('assets/map_bg_gradient.png');

type Props = {|
  +setSetupArea: ({ area: CountryArea, snapshot: string }) => SetupAction,
  +coordinates: Array<Array<number>>,
  +setupCountry: ?Country,
  +componentId: string
|};

class SetupBoundaries extends Component<Props> {
  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed({ buttonId }: NavigationButtonPressedEvent) {
    if (buttonId === 'settings') {
      Navigation.mergeOptions(this.props.componentId, {
        sideMenu: {
          right: {
            visible: true
          }
        }
      });
    } else if (buttonId === 'backButton') {
      Navigation.pop('ForestWatcher.Map');
    }
  }

  onDrawAreaFinish = (area: CountryArea, snapshot: string) => {
    this.props.setSetupArea({ area, snapshot });
    Navigation.push('ForestWatcher.Map', {
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
        />
        <View pointerEvents="none" style={styles.header}>
          <Image style={styles.headerBg} source={backgroundImage} />
        </View>
      </View>
    );
  }
}

export default SetupBoundaries;
