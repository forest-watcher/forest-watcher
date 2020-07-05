// @flow

import type { OfflineMeta } from 'types/offline.types';
import type { DeleteAreaCommit, SaveAreaCommit } from 'types/areas.types';
import type { LayerType } from 'types/sharing.types';

export type VectorMapLayer = {
  filter?: ?*,
  paint: *,
  'source-layer': string,
  type: 'background' | 'fill' | 'line' | 'symbol' | 'raster' | 'circle' | 'fill-extrusion' | 'heatmap' | 'hillshade'
};

export type ContextualLayerRenderSpec = {
  isShareable: boolean,
  maxZoom?: ?number,
  minZoom?: ?number,
  tileFormat?: ?('vector' | 'raster'),
  vectorMapLayers?: ?Array<VectorMapLayer>
};

export type Layer = {
  createdAt?: ?string,
  description?: ?string,
  enabled?: ?boolean,
  id: string,
  isPublic?: ?boolean,
  name?: string,
  owner?: ?{
    type: string
  },
  type: LayerType,
  url?: ?string,
  isImported?: true, // Flag indicating whether or not this was imported from a sharing bundle
  isCustom?: ?boolean, // Flag indicating whether or not this is a custom one added by the user
  size?: ?number, // The size of this content on disk.
  styleURL?: string,
  image?: number
};

export type LayerDownloadProgress = { [layerId: string]: LayersCacheStatus };

export type LayersState = {
  data: Array<Layer>,
  synced: boolean,
  syncing: boolean,
  syncDate: number,
  importError: ?Error,
  imported: Array<Layer>,
  importingLayer: boolean,
  downloadedLayerProgress: LayerDownloadProgress
};

export type LayersProgress = {
  [string]: { layerId: number }
};

export type LayerCacheData = {
  progress: number,
  completed: boolean,
  requested: boolean,
  error: boolean
};

export type LayersCacheStatus = {
  [string]: LayerCacheData
};

export type UpdateProgressActionType = 'layers/IMPORT_LAYER_PROGRESS';

export type LayersPendingCache = {
  [string]: { areaId: boolean }
};

export type LayersAction =
  | GetLayersRequest
  | GetLayersCommit
  | GetLayersRollback
  | SetCacheStatus
  | DeleteAreaCommit
  | ImportLayerRequest
  | ImportLayerProgress
  | ImportLayerAreaCompleted
  | ImportLayerCommit
  | ImportLayerClear
  | ImportLayerRollback
  | RenameLayer
  | DeleteLayer
  | SaveAreaCommit;

type GetLayersRequest = {
  type: 'layers/GET_LAYERS_REQUEST',
  meta: OfflineMeta
};
type GetLayersCommit = {
  type: 'layers/GET_LAYERS_COMMIT',
  payload: Array<Layer>
};
type GetLayersRollback = { type: 'layers/GET_LAYERS_ROLLBACK' };

type ImportLayerProgress = {
  type: 'layers/IMPORT_LAYER_PROGRESS',
  payload: {
    id: string,
    layerId: string,
    progress: number
  }
};
type SetCacheStatus = {
  type: 'layers/RESET_REGION_PROGRESS',
  payload: { [layerId: string]: LayersCacheStatus }
};

type ImportLayerRequest = {
  type: 'layers/IMPORT_LAYER_REQUEST',
  // We only attach the below payload when importing remote layers.
  payload?: { dataId: string, layerId: string, remote: boolean }
};
type ImportLayerAreaCompleted = {
  type: 'layers/IMPORT_LAYER_AREA_COMPLETED',
  payload: {
    id: string,
    layerId: string,
    failed: boolean
  }
};
type ImportLayerCommit = { type: 'layers/IMPORT_LAYER_COMMIT', payload: Layer };
type ImportLayerClear = { type: 'layers/IMPORT_LAYER_CLEAR' };
type ImportLayerRollback = {
  type: 'layers/IMPORT_LAYER_ROLLBACK',
  payload: ?Error | { dataId: string, layerId: string }
};
type RenameLayer = { type: 'layers/RENAME_LAYER', payload: { id: string, name: string } };
type DeleteLayer = { type: 'layers/DELETE_LAYER', payload: string };
