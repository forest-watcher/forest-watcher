// @flow

import type { Route } from 'types/routes.types';

import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { isValidLatLng } from 'helpers/location';

type Props = {
  route: Route,
  style: *
};

export default class RoutePreviewImage extends PureComponent<Props> {
  render() {
    const { route, style } = this.props;
    let minLatitude = Infinity;
    let maxLatitude = -Infinity;
    let minLongitude = Infinity;
    let maxLongitude = -Infinity;

    if (!route.locations || route.locations.length === 0) {
      return null;
    }

    [...route.locations, route.destination].forEach(location => {
      if (!isValidLatLng(location)) {
        return;
      }
      if (location.latitude < minLatitude) {
        minLatitude = location.latitude;
      }
      if (location.latitude > maxLatitude) {
        maxLatitude = location.latitude;
      }
      if (location.longitude < minLongitude) {
        minLongitude = location.longitude;
      }
      if (location.longitude > maxLongitude) {
        maxLongitude = location.longitude;
      }
    });

    return (
      <View style={{ ...style, overflow: 'hidden' }} pointerEvents={'none'}>
        <Text>*TODO Route Preview*</Text>
      </View>
    );
  }
}
