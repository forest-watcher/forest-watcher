// @flow
import type { Layer, LayersCacheStatus } from 'types/layers.types';

export type BasemapsState = {
  downloadedBasemapProgress: { [basemapId: string]: LayersCacheStatus },
  importedBasemaps: Array<Layer>,
  importError: ?Error,
  importing: boolean
};

export type BasemapsAction =
  | ImportBasemapRequest
  | ImportBasemapProgress
  | ImportBasemapAreaCompleted
  | ImportBasemapCommit
  | ImportBasemapClear
  | ImportBasemapRollback
  | RenameBasemap
  | DeleteBasemap;

export type ImportBasemapRequest = {
  type: 'basemaps/IMPORT_BASEMAP_REQUEST', // We only attach the below payload when importing remote basemaps.
  payload?: { dataId: string, layerId: string, remote: boolean }
};
type ImportBasemapProgress = {
  type: 'basemaps/IMPORT_BASEMAP_PROGRESS',
  payload: {
    id: string,
    layerId: string,
    progress: number
  }
};
type ImportBasemapAreaCompleted = {
  type: 'basemaps/IMPORT_BASEMAP_AREA_COMPLETED',
  payload: {
    id: string,
    layerId: string,
    failed: boolean
  }
};
export type ImportBasemapCommit = { type: 'basemaps/IMPORT_BASEMAP_COMMIT', payload: Layer };
export type ImportBasemapClear = { type: 'basemaps/IMPORT_BASEMAP_CLEAR' };
export type ImportBasemapRollback = { type: 'basemaps/IMPORT_BASEMAP_ROLLBACK', payload: ?Error };
export type RenameBasemap = { type: 'basemaps/RENAME_BASEMAP', payload: { id: string, name: string } };
export type DeleteBasemap = { type: 'basemaps/DELETE_BASEMAP', payload: string };
