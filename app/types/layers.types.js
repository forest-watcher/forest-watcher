// @flow

import type { OfflineMeta } from 'types/offline.types';
import type { DeleteAreaCommit, SaveAreaCommit, Area } from 'types/areas.types';
import type { Basemap } from 'types/basemaps.types';

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

export type ContextualLayer = {
  createdAt?: ?string,
  description?: ?string,
  enabled?: ?boolean,
  id: string,
  isPublic?: ?boolean,
  name?: string,
  owner?: ?{
    type: string
  },
  url: string,
  isImported?: true,
  isCustom?: ?boolean,
  size?: ?number
};

export type LayersState = {
  data: Array<ContextualLayer>,
  synced: boolean,
  syncing: boolean,
  activeLayer: ?string,
  syncDate: number,
  layersProgress: LayersProgress,
  cacheStatus: LayersCacheStatus,
  cache: LayersCache,
  pendingCache: LayersPendingCache,
  importError: ?Error,
  imported: Array<ContextualLayer>,
  importingLayer: boolean,
  downloadedLayerProgress: { [layerId: string]: LayersCacheStatus }
};

export type LayersProgress = {
  [string]: { layerId: number }
};

export type LayersCacheStatus = {
  [string]: {
    progress: number,
    completed: boolean,
    requested: boolean,
    error: boolean
  }
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
  | SetActiveContextualLayer
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
  payload: Array<ContextualLayer>,
  meta: { areas: Array<Area> }
};
type GetLayersRollback = { type: 'layers/GET_LAYERS_ROLLBACK' };
type SetActiveContextualLayer = { type: 'layers/SET_ACTIVE_LAYER', payload: ?string };

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
type DownloadData = { type: 'layers/DOWNLOAD_DATA', payload: { dataId: string, basemaps: Array<Basemap> } };
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
type ImportLayerCommit = { type: 'layers/IMPORT_LAYER_COMMIT', payload: ContextualLayer };
type ImportLayerClear = { type: 'layers/IMPORT_LAYER_CLEAR' };
type ImportLayerRollback = {
  type: 'layers/IMPORT_LAYER_ROLLBACK',
  payload: ?Error | { dataId: string, layerId: string }
};
type RenameLayer = { type: 'layers/RENAME_LAYER', payload: { id: string, name: string } };
type DeleteLayer = { type: 'layers/DELETE_LAYER', payload: string };
