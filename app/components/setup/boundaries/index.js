import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View
} from 'react-native';

import DrawAreas from 'components/setup/draw-areas';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

class SetupBoundaries extends Component {

  static propTypes = {
    setSetupArea: PropTypes.func.isRequired,
    setupCountry: PropTypes.object.isRequired,
    onNextPress: PropTypes.func.isRequired,
    contextualLayer: PropTypes.object
  };

  componentDidMount() {
    tracker.trackScreenView('Boundaries');
  }

  onDrawAreaFinish = (area, snapshot) => {
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
