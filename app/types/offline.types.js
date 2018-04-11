// @flow

export type OfflineMeta = {
  offline: {
    effect: {
      url: string,
      method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      errorCode?: number,
      headers?: Object,
      deserialize?: boolean
    },
    commit: { type: string, meta?: Object },
    rollback: { type: string, meta?: Object }
  }
}
