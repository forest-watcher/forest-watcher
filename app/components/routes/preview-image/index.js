// @flow

import type { Route } from 'types/routes.types';

import React, { PureComponent } from 'react';
import { View } from 'react-native';
import Basemap from 'containers/map/basemap';
import RouteMarkers from 'components/map/route';
import MapView from 'react-native-maps';

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

    if (!route.locations) {
      return null;
    }

    [...route.locations, route.destination].forEach(location => {
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
        <MapView
          style={{
            alignSelf: 'stretch',
            bottom: -26,
            flex: 1
          }}
          provider={MapView.PROVIDER_GOOGLE}
          mapType="none"
          loadingEnabled={true}
          initialRegion={{
            latitude: minLatitude + (maxLatitude - minLatitude) / 2,
            longitude: minLongitude + (maxLongitude - minLongitude) / 2,
            latitudeDelta: (maxLatitude - minLatitude) * 2,
            longitudeDelta: (maxLongitude - minLongitude) * 2
          }}
        >
          <Basemap areaId={route.areaId} />
          <RouteMarkers isTracking={false} route={route} />
        </MapView>
      </View>
    );
  }
}
