// @flow
import type { LayersCacheStatus } from 'types/layers.types';

export type Basemap = {
  // The unique identifier for this basemap.
  id: string,
  styleURL?: string,
  // The given name of the basemap.
  name: string,
  image?: number,
  tileUrl?: ?string,
  // Where the file is saved within the app's documents directory.
  path?: string,
  // The size of this basemap on disk.
  size?: number,

  /**
   * Flag indicating whether or not this basemap is a custom one added by the user
   */
  isCustom?: boolean,

  /**
   * Flag indicating whether or not this basemap was imported from a sharing bundle
   */
  isImported?: boolean
};

export type BasemapsState = {
  downloadedBasemapProgress: { [basemapId: string]: LayersCacheStatus },
  importedBasemaps: Array<Basemap>,
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
export type ImportBasemapCommit = { type: 'basemaps/IMPORT_BASEMAP_COMMIT', payload: Basemap };
export type ImportBasemapClear = { type: 'basemaps/IMPORT_BASEMAP_CLEAR' };
export type ImportBasemapRollback = { type: 'basemaps/IMPORT_BASEMAP_ROLLBACK', payload: ?Error };
export type RenameBasemap = { type: 'basemaps/RENAME_BASEMAP', payload: { id: string, name: string } };
export type DeleteBasemap = { type: 'basemaps/DELETE_BASEMAP', payload: string };
