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
  payload: { areaId: string, layerId: string }
};
type CacheLayerCommit = {
  type: 'layers/CACHE_LAYER_COMMIT',
  payload: { areaId: string, layerId: string, path?: string }
};
type CacheLayerRollback = {
  type: 'layers/CACHE_LAYER_ROLLBACK',
  payload: { areaId: string, layerId: string }
};
type DownloadArea = { type: 'layers/DOWNLOAD_AREA', payload: { area: Area, basemaps: Array<Basemap> } };
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
