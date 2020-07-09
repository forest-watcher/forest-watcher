// @flow
import type { ContextualLayerSettingsType } from 'types/layerSettings.types';
import type { Layer, LayersCacheStatus } from 'types/layers.types';

import React, { Component } from 'react';
import GeoJSONContextualLayer from 'components/map/contextual-layers/geojson-layer';
import TileContextualLayer from 'components/map/contextual-layers/tile-layer';

type Props = {
  +featureId: string,
  +isOfflineMode: boolean,
  +layers: Array<Layer>,
  +layerCache: { [id: string]: LayersCacheStatus },
  +layerSettings: ContextualLayerSettingsType
};

// Renders all active imported contextual layers in settings
export default class ContextualLayers extends Component<Props> {
  render() {
    const { featureId, layers, layerCache, layerSettings, isOfflineMode } = this.props;
    if (!layerSettings.layerIsActive) {
      return null;
    }

    return (
      <React.Fragment>
        {layers.map(layer =>
          layer.isCustom ? (
            <GeoJSONContextualLayer key={layer.id} layer={layer} />
          ) : (
            <TileContextualLayer
              key={layer.id}
              featureId={featureId}
              layer={layer}
              layerCache={layerCache[layer.id] ?? {}}
              isOfflineMode={isOfflineMode}
            />
          )
        )}
      </React.Fragment>
    );
  }
}
