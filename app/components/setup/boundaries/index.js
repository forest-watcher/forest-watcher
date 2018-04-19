// @flow
import type { CountryArea } from 'types/setup.types';
import type { Country } from 'types/countries.types';
import type { ContextualLayer } from 'types/layers.types';

import React, { Component } from 'react';
import {
  View
} from 'react-native';

import DrawAreas from 'components/setup/draw-areas';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

type Props = {
  setSetupArea: (area: CountryArea, snapshot: string) => void,
  setupCountry: Country,
  onNextPress: () => void,
  contextualLayer: ContextualLayer
};

class SetupBoundaries extends Component<Props> {

  componentDidMount() {
    tracker.trackScreenView('Boundaries');
  }

  onDrawAreaFinish = (area: CountryArea, snapshot: string) => {
    this.props.setSetupArea(area, snapshot);
    return this.props.onNextPress();
  }

  render() {
    return (
      <View style={styles.container}>
        <DrawAreas
          country={this.props.setupCountry}
          onDrawAreaFinish={this.onDrawAreaFinish}
          contextualLayer={this.props.contextualLayer}
        />
      </View>
    );
  }
}

export default SetupBoundaries;
