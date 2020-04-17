// @flow

import type { Route } from 'types/routes.types';

import React, { PureComponent } from 'react';
import { View, ImageBackground, Platform } from 'react-native';

import RoutePath from 'components/common/route-path';

import styles from './styles';

const routeMapBackground = require('assets/routeMapBackground.png');

type Props = {
  route: Route,
  style: *,
  aspectRatio: number,
  width: number
};

export default class RoutePreviewImage extends PureComponent<Props> {
  render() {
    const { aspectRatio, width, route, style } = this.props;
    const height = width * aspectRatio;
    return (
      <View style={{ ...style, height, overflow: 'hidden' }} pointerEvents={'none'}>
        <ImageBackground
          style={styles.image}
          resizeMode={Platform.OS === 'ios' ? 'repeat' : 'cover'}
          source={routeMapBackground}
        >
          <RoutePath size={height - 12} route={route} />
        </ImageBackground>
      </View>
    );
  }
}
