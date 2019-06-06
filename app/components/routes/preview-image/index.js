// @flow

import type { Route } from 'types/routes.types';

import React, { PureComponent } from 'react';
import { View } from 'react-native';
import Basemap from 'containers/map/basemap';
import RouteMarkers from 'components/map/route';
import MapView from 'react-native-maps';

type Props = {
  route: Route
};

export default class RoutePreviewImage extends PureComponent<Props> {
  render() {
    const { route, style, ...rest } = this.props;
    let minLatitude = Infinity;
    let maxLatitude = -Infinity;
    let minLongitude = Infinity;
    let maxLongitude = -Infinity;

    route.locations.forEach(location => {
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
      <View style={style} pointerEvents={'none'}>
        <MapView
          style={{
            alignSelf: 'stretch',
            flex: 1
          }}
          provider={MapView.PROVIDER_GOOGLE}
          mapType="none"
          loadingEnabled={true}
          initialRegion={{
            latitude: minLatitude + (maxLatitude - minLatitude) / 2,
            longitude: minLongitude + (maxLongitude - minLongitude) / 2,
            latitudeDelta: (maxLatitude - minLatitude) * 1.1,
            longitudeDelta: (maxLongitude - minLongitude) * 1.1
          }}
        >
          <Basemap areaId={route.areaId} />
          <RouteMarkers isTracking={false} markerBorder={5} markerSize={5} route={route} />
        </MapView>
      </View>
    );
  }
}
