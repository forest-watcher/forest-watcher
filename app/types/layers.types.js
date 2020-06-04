// @flow

import type { OfflineMeta } from 'types/offline.types';
import type { DeleteAreaCommit, SaveAreaCommit, Area } from 'types/areas.types';

export type VectorMapLayer = {
  filter?: ?*,
  paint: *,
  'source-layer': string,
  type: 'background' | 'fill' | 'line' | 'symbol' | 'raster' | 'circle' | 'fill-extrusion' | 'heatmap' | 'hillshade'
};

export type ContextualLayer = {
  createdAt?: ?string,
  description?: ?string,
  enabled?: ?boolean,
  id: string,
  isPublic?: ?boolean,
  maxZoom?: ?number,
  minZoom?: ?number,
  name?: string,
  owner?: ?{
    type: string
  },
  url: string,
  isImported?: true,
  isGFW?: ?boolean,
  size?: ?number,
  tileFormat?: ?('vector' | 'raster'),
  vectorMapLayers?: ?Array<VectorMapLayer>
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
  importingLayer: boolean
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

type LayersCache = {
  [string]: { areaId: string }
};

export type LayersPendingCache = {
  [string]: { areaId: boolean }
};

export type LayersAction =
  | GetGFWLayersRequest
  | GetGFWLayersCommit
  | GetGFWLayersRollback
  | GetLayersRequest
  | GetLayersCommit
  | GetLayersRollback
  | SetActiveContextualLayer
  | UpdateProgress
  | CacheLayerRequest
  | CacheLayerCommit
  | CacheLayerRollback
  | DownloadArea
  | InvalidateCache
  | SetCacheStatus
  | DeleteAreaCommit
  | ImportLayerRequest
  | ImportLayerCommit
  | ImportLayerClear
  | ImportLayerRollback
  | RenameLayer
  | DeleteLayer
  | SaveAreaCommit;

type GetGFWLayersRequest = {
  type: 'layers/GET_GFW_LAYERS_REQUEST',
  meta: OfflineMeta
};
type GetGFWLayersCommit = {
  type: 'layers/GET_GFW_LAYERS_COMMIT',
  payload: {
    data: Array<*>,
    links: {
      first: string,
      last: string,
      self: string,
      next: string,
      prev: string
    },
    meta: {
      'total-pages': number,
      'total-items': number,
      size: number
    }
  },
  meta: { page: number }
};
type GetGFWLayersRollback = {
  type: 'layers/GET_GFW_LAYERS_ROLLBACK',
  payload: {
    type: string,
    response: *
  }
};

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
type UpdateProgress = {
  type: 'layers/UPDATE_PROGRESS',
  payload: {
    areaId: string,
    layerId: string,
    progress: number
  }
};
type CacheLayerRequest = {
  type: 'layers/CACHE_LAYER_REQUEST',
  payload: { area: Area, layer: ContextualLayer }
};
type CacheLayerCommit = {
  type: 'layers/CACHE_LAYER_COMMIT',
  payload: string,
  meta: { area: Area, layer: ContextualLayer }
};
type CacheLayerRollback = {
  type: 'layers/CACHE_LAYER_ROLLBACK',
  meta: { layer: ContextualLayer, area: Area }
};
type DownloadArea = { type: 'layers/DOWNLOAD_AREA', payload: Area };
type InvalidateCache = { type: 'layers/INVALIDATE_CACHE', payload: string };
type SetCacheStatus = {
  type: 'layers/SET_CACHE_STATUS',
  payload: LayersCacheStatus
};

type ImportLayerRequest = { type: 'layers/IMPORT_LAYER_REQUEST' };
type ImportLayerCommit = { type: 'layers/IMPORT_LAYER_COMMIT', payload: ContextualLayer };
type ImportLayerClear = { type: 'layers/IMPORT_LAYER_CLEAR' };
type ImportLayerRollback = { type: 'layers/IMPORT_LAYER_ROLLBACK', payload: ?Error };
type RenameLayer = { type: 'layers/RENAME_LAYER', payload: { id: string, name: string } };
type DeleteLayer = { type: 'layers/DELETE_LAYER', payload: string };
