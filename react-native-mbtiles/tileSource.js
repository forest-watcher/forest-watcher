// @flow
import ReactNativeMBTiles, { type MBTileBasemapMetadata } from 'react-native-mbtiles';
import React, { PureComponent } from 'react';
import { AppState, Platform } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

type Props = {
  basemapId: string,
  basemapPath: ?string,
  belowLayerID: string,
  port: number
};

type State = {
  metadata: ?MBTileBasemapMetadata
};

export default class MBTilesSource extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    AppState.addEventListener('change', this.handleAppStateChange);

    this.state = {
      metadata: null
    };

    this.prepareOfflineBasemapForUse();
  }

  componentWillUnmount() {
    ReactNativeMBTiles.stopServer();
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = (status: string) => {
    if (!this.state.metadata) {
      // There's no metadata, so no server to start / stop.
      return;
    }

    switch (status) {
      case 'background':
      case 'inactive': {
        ReactNativeMBTiles.stopServer();
        break;
      }
      case 'active':
        ReactNativeMBTiles.startServer(this.props.port);
        break;
    }
  };

  prepareOfflineBasemapForUse = (port: number = this.props.port) => {
    this.setState({ metadata: null });

    if (!this.props.basemapPath) {
      return;
    }

    ReactNativeMBTiles.prepare(this.props.basemapId, this.props.basemapPath, (error, metadata) => {
      if (!metadata) {
        console.warn('3SC', 'No metadata for the selected basemap');
        return;
      }

      ReactNativeMBTiles.stopServer();
      ReactNativeMBTiles.startServer(port);

      if (Platform.OS === 'android') {
        MapboxGL.setConnected(true);
      }

      this.setState({
        metadata
      });
    });
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.basemapId !== this.props.basemapId || prevProps.basemapPath !== this.props.basemapPath) {
      this.prepareOfflineBasemapForUse();
    }
  }

  render() {
    const { basemapId, port, belowLayerID } = this.props;
    const metadata = this.state.metadata;

    if (!metadata) {
      return null;
    }

    if (metadata.isVector) {
      // Not supported!
      return null;
    } else {
      return (
        <MapboxGL.RasterSource
          id="basemapTiles"
          minZoomLevel={metadata.minZoomLevel}
          maxZoomLevel={metadata.maxZoomLevel}
          tileSize={metadata.tileSize}
          tms={metadata.tms}
          tileUrlTemplates={[`http://localhost:${port}/gfwmbtiles/${basemapId}?z={z}&x={x}&y={y}`]}
        >
          <MapboxGL.RasterLayer belowLayerID={belowLayerID} id="basemapTileLayer" />
        </MapboxGL.RasterSource>
      );
    }
  }
}
