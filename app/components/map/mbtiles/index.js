// @flow
import type { MBTileBasemapMetadata } from 'types/basemaps.types';

import React, { PureComponent } from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

import { mapboxStyles } from '../styles';

type Props = {
  basemapId: ?string,
  metadata: ?MBTileBasemapMetadata,
  port: number
};

export default class MBTilesSource extends PureComponent<Props> {
  render() {
    const { basemapId, metadata, port } = this.props;

    if (!basemapId || !metadata) {
      return null;
    }

    if (metadata.isVector) {
      return (
        <MapboxGL.VectorSource
          id={'basemap' + basemapId}
          minZoomLevel={metadata.minZoomLevel}
          maxZoomLevel={metadata.maxZoomLevel}
          tileSize={metadata.tileSize}
          tms={metadata.tms}
          tileUrlTemplates={[`http://localhost:${port}/gfwmbtiles/${basemapId}?z={z}&x={x}&y={y}`]}
        >
          <MapboxGL.SymbolLayer
            //filter={['match', ['geometry-type'], ['Point', 'MultiPoint'], true, false]}
            id={'basemap_symbol_' + basemapId}
            sourceID={'basemap' + basemapId}
            style={mapboxStyles.icon}
          />
          <MapboxGL.LineLayer id={'basemap_line_' + basemapId} style={mapboxStyles.geoJsonStyleSpec} />
          <MapboxGL.FillLayer
            //filter={['match', ['geometry-type'], ['LineString', 'MultiLineString'], false, true]}
            id={'basemap_fill_' + basemapId.id}
            style={mapboxStyles.geoJsonStyleSpec}
          />
        </MapboxGL.VectorSource>
      );
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
          <MapboxGL.RasterLayer id="basemapTileLayer" />
        </MapboxGL.RasterSource>
      );
    }
  }
}
