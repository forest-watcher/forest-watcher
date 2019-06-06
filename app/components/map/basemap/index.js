// @flow

import React, { PureComponent } from 'react';
import MapView from 'react-native-maps';
import { MAPS } from '../../../config/constants';

type Props = {
  isOfflineMode: boolean,
  localTilePath: string
};

export default class Basemap extends PureComponent<Props> {
  render() {
    return (
      <React.Fragment>
        {this.props.localTilePath ? (
          <MapView.LocalTile
            key="localBasemapLayerElementL"
            pathTemplate={this.props.localTilePath}
            zIndex={-2}
            maxZoom={12}
            tileSize={256}
          />
        ) : null}
        {!this.props.isOfflineMode ? (
          <MapView.UrlTile key="basemapLayerElement" urlTemplate={MAPS.basemap} zIndex={-1} />
        ) : null}
      </React.Fragment>
    );
  }
}
