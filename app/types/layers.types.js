// @flow

import type { OfflineMeta } from 'types/offline.types';
import type { DeleteAreaCommit, SaveAreaCommit, Area } from 'types/areas.types';
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

/**
 * This model is returned by the API but we also use it for local-only layers
 */
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
  url?: ?string, // A remote tile URL pattern from which the layer can be downloaded
  isImported?: true, // Flag indicating whether or not this was imported from a sharing bundle
  isCustom?: ?boolean, // Flag indicating whether or not this is a custom one added by the user
  size?: ?number, // The size of this content on disk.
  image?: number
};

export type LayersState = {
  data: Array<Layer>,
  synced: boolean,
  syncing: boolean,
  syncDate: number,
  layersProgress: LayersProgress,
  cacheStatus: LayersCacheStatus,
  cache: LayersCache,
  pendingCache: LayersPendingCache,
  importError: ?Error,
  imported: Array<Layer>,
  importingLayer: boolean,
  downloadedLayerProgress: { [layerId: string]: LayersCacheStatus }
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

export type UpdateProgressActionType = 'layers/UPDATE_PROGRESS' | 'layers/IMPORT_LAYER_PROGRESS';

type LayersCache = {
  [string]: { areaId: string }
};

export type LayersPendingCache = {
  [string]: { areaId: boolean }
};

export type LayersAction =
  | GetLayersRequest
  | GetLayersCommit
  | GetLayersRollback
  | UpdateProgress
  | CacheLayerRequest
  | CacheLayerCommit
  | CacheLayerRollback
  | DownloadData
  | InvalidateCache
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
  payload: Array<Layer>,
  meta: { areas: Array<Area> }
};
type GetLayersRollback = { type: 'layers/GET_LAYERS_ROLLBACK' };

// For consistency & reuse, the update progress actions use the same payload structure.
type UpdateProgress = {
  type: 'layers/UPDATE_PROGRESS',
  payload: {
    id: string,
    layerId: string,
    progress: number
  }
};
type ImportLayerProgress = {
  type: 'layers/IMPORT_LAYER_PROGRESS',
  payload: {
    id: string,
    layerId: string,
    progress: number
  }
};
type CacheLayerRequest = {
  type: 'layers/CACHE_LAYER_REQUEST',
  payload: { dataId: string, layerId: string }
};
type CacheLayerCommit = {
  type: 'layers/CACHE_LAYER_COMMIT',
  payload: { dataId: string, layerId: string, path?: string }
};
type CacheLayerRollback = {
  type: 'layers/CACHE_LAYER_ROLLBACK',
  payload: { dataId: string, layerId: string }
};
type DownloadData = { type: 'layers/DOWNLOAD_DATA', payload: { dataId: string, basemaps: Array<Layer> } };
type InvalidateCache = { type: 'layers/INVALIDATE_CACHE', payload: string };
type SetCacheStatus = {
  type: 'layers/SET_CACHE_STATUS',
  payload: LayersCacheStatus
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
