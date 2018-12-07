// @flow

import type { State } from 'types/store.types';

export type OfflineMeta = {
  offline: {
    effect: {
      url: string,
      method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      errorCode?: number,
      headers?: Object,
      deserialize?: boolean
    },
    commit: { type: string, meta?: any },
    rollback: { type: string, meta?: any }
  }
};

export type PersistRehydrate = { type: 'persist/REHYDRATE', payload: State };
