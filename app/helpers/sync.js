// @flow
import type { State } from 'types/store.types';

export function getActionsTodoCount(pendingData: Object) {
  if (!pendingData || typeof pendingData !== 'object') {
    return 0;
  }
  return Object.keys(pendingData).reduce(
    (acc, next) =>
      acc +
      Object.keys(pendingData[next]).reduce(
        (acc2, action) =>
          // true means the action is being done
          // so we don't have to sum it;
          acc2 + (pendingData[next][action] ? 0 : 1),
        0
      ),
    0
  );
}

function getTotalActionsTodoCount(state: State) {
  const modulesToSync = [
    !state.areas.synced && !state.areas.syncing,
    !state.user.synced && !state.user.syncing,
    !state.layers.synced && !state.layers.syncing,
    !state.reports.synced && !state.reports.syncing
  ];
  return modulesToSync.reduce((ac, next) => (next ? ac + 1 : ac), 0);
}

function getTotalActionsInProgessCount(state: State) {
  const actionsInProgress = [
    !state.areas.synced && state.areas.syncing,
    !state.user.synced && state.user.syncing,
    !state.layers.synced && state.layers.syncing,
    !state.reports.synced && state.reports.syncing
  ];
  return actionsInProgress.reduce((ac, next) => (next ? ac + 1 : ac), 0) + state.alerts.queue.length;
}

export function getTotalActionsPending(state: State) {
  return getTotalActionsTodoCount(state) + getTotalActionsInProgessCount(state);
}

export function hasSyncFinished(state: State) {
  return getTotalActionsPending(state) === 0;
}
