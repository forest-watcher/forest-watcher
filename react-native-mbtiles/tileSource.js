// @flow
import ReactNativeMBTiles, { type MBTileBasemapMetadata } from 'react-native-mbtiles';
import React, { PureComponent } from 'react';
import { AppState, Platform } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

import { pathForMBTilesFile } from 'helpers/layer-store/layerFilePaths';

type Basemap = {
  isImported: boolean,
  // The unique identifier for this basemap.
  id: string,
  styleURL?: string,
  // The given name of the basemap.
  name: string,
  image?: number,
  tileUrl?: ?string,
  // Where the file is saved within the app's documents directory.
  path?: string,
  // The size of this basemap on disk.
  size?: number
};

type Props = {
  basemap: ?Basemap,
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

    const basemap = props.basemap;

    if (!basemap || !basemap?.isImported) {
      return;
    }

    this.prepareOfflineBasemapForUse(basemap);
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

  prepareOfflineBasemapForUse = (basemap: ?Basemap, port: number = this.props.port) => {
    this.setState({ metadata: null });

    if (!basemap || !basemap?.isImported) {
      return;
    }

    const basemapPath = pathForMBTilesFile(basemap);
    ReactNativeMBTiles.prepare(basemap.id, basemapPath, (error, metadata) => {
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
    if (prevProps.basemap?.id !== this.props.basemap?.id) {
      this.prepareOfflineBasemapForUse(this.props.basemap);
    }
  }

  render() {
    const { basemap, port } = this.props;
    const metadata = this.state.metadata;

    if (!basemap || !metadata || !basemap?.isImported) {
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
          tileUrlTemplates={[`http://localhost:${port}/gfwmbtiles/${basemap.id}?z={z}&x={x}&y={y}`]}
        >
          <MapboxGL.RasterLayer belowLayerID={'areaOutlineLayer'} id="basemapTileLayer" />
        </MapboxGL.RasterSource>
      );
    }
  }
}
