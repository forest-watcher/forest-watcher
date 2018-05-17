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
  showLegend: boolean,
  layersProgress: Object,
  cacheStatus: Object,
  cache: Object,
  pendingCache: Object
}
