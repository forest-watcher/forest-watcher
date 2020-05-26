// @flow

import React, { Component, type ElementConfig } from 'react';
import { View } from 'react-native';
import styles from './styles';
import { withSafeArea } from 'react-native-safe-area';

const SafeAreaView = withSafeArea(View, 'margin', 'bottom');

type Props = {
  ...ElementConfig<typeof View>,
  requiresSafeAreaView: boolean
};

class BottomTray extends Component<Props> {
  render() {
    const ViewComponent = this.props.requiresSafeAreaView ? SafeAreaView : View;

    return (
      <View style={styles.container}>
        <ViewComponent style={this.props.style}>{this.props.children}</ViewComponent>
      </View>
    );
  }
}

export default BottomTray;
