// @flow
import type { State } from 'types/store.types';

export function getTotalActionsTodoCount(state: State) {
  const modulesToSync = [
    !state.areas.synced && !state.areas.syncing,
    !state.user.synced && !state.user.syncing,
    !state.layers.synced && !state.layers.syncing,
    !state.reports.synced && !state.reports.syncing
  ];
  return modulesToSync.reduce((ac, next) => (next ? ac + 1 : ac), 0) + state.alerts.queue.length;
}

export function getTotalActionsInProgessCount(state: State) {
  const actionsInProgress = [
    !state.areas.synced && state.areas.syncing,
    !state.user.synced && state.user.syncing,
    !state.layers.synced && state.layers.syncing,
    !state.reports.synced && state.reports.syncing
  ];
  return actionsInProgress.reduce((ac, next) => (next ? ac + 1 : ac), 0);
}

export function getTotalActionsPending(state: State) {
  return getTotalActionsTodoCount(state) + getTotalActionsInProgessCount(state);
}

export function hasSyncFinished(state: State) {
  return (getTotalActionsPending(state)) === 0;
}
