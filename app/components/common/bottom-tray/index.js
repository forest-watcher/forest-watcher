// @flow

import React, { Component, type ElementConfig } from 'react';
import { View } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';
import { withSafeArea } from 'react-native-safe-area';

import Theme from 'config/theme';

import styles from './styles';

const SafeAreaView = withSafeArea(View, 'margin', 'bottom');

type Props = {
  ...ElementConfig<typeof View>,
  requiresSafeAreaView: boolean,
  showProgressBar?: boolean
};

class BottomTray extends Component<Props> {
  render() {
    const ViewComponent = this.props.requiresSafeAreaView ? SafeAreaView : View;

    return (
      <View style={styles.container}>
        {!!this.props.showProgressBar && (
          <ProgressBar
            indeterminate
            width={Theme.screen.width}
            height={4}
            color={Theme.colors.turtleGreen}
            borderRadius={0}
            borderColor="transparent"
            style={{ marginTop: -2 }}
          />
        )}
        <View style={styles.innerContainer}>
          <ViewComponent style={this.props.style}>{this.props.children}</ViewComponent>
        </View>
      </View>
    );
  }
}

export default BottomTray;
