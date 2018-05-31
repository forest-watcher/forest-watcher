// @flow

export type ContextualLayer = {
  id: string,
  name: string,
  url: string
};

export type LayersState = {
  data: Array<ContextualLayer>,
  synced: boolean,
  syncing: boolean,
  activeLayer: boolean,
  syncDate: number,
  layersProgress: Object,
  cacheStatus: Object,
  cache: Object,
  pendingCache: Object
}
