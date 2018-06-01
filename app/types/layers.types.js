// @flow

import type { OfflineMeta } from 'types/offline.types';
import type { DeleteAreaCommit, Area } from 'types/areas.types';

export type ContextualLayer = {
  id: string,
  name: string,
  url: string
};

export type LayersState = {
  data: Array<ContextualLayer>,
  synced: boolean,
  syncing: boolean,
  activeLayer: ?boolean,
  syncDate: number,
  layersProgress: LayersProgress,
  cacheStatus: LayersCacheStatus,
  cache: LayersCache,
  pendingCache: LayersPendingCache
}

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
}

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
;

type GetLayersRequest = {
  type: 'layers/GET_LAYERS_REQUEST',
  meta: OfflineMeta
};
type GetLayersCommit = {
  type: 'layers/GET_LAYERS_COMMIT',
  payload: Array<ContextualLayer>,
  meta: { areas: Array<Area> }
}
type GetLayersRollback = { type: 'layers/GET_LAYERS_ROLLBACK' };
type SetActiveContextualLayer = { type: 'layers/SET_ACTIVE_LAYER', payload: string };
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
  meta: { area: Area, layer: ContextualLayer },
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
