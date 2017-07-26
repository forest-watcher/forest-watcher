// loop through the pending data object looking for actions that hasn't been dispatched yet
// return the num of actions to be dispatched
export function getActionsTodoCount(pendingData) {
  if (!pendingData || typeof pendingData !== 'object') return 0;
  return Object.keys(pendingData).reduce((acc, next) => (
    acc + Object.keys(pendingData[next]).reduce((acc2, action) => (
      // true means the action is being done
      // so we don't have to sum it;
      acc2 + (pendingData[next][action] ? 0 : 1)
    ), 0)
  ), 0);
}

export function getActionsInProgessCount(pendingData) {
  if (!pendingData || typeof pendingData !== 'object') return 0;
  return Object.keys(pendingData).reduce((acc, next) => (
    acc + Object.keys(pendingData[next]).reduce((acc2, action) => (
      // true means the action is being done
      // so we have to sum it;
      acc2 + (!pendingData[next][action] ? 0 : 1)
    ), 0)
  ), 0);
}

export function getTotalActionsTodoCount(state) {
  const actionsPending = [
    !state.areas.synced && !state.areas.syncing,
    !state.user.synced && !state.user.syncing,
    !state.layers.synced && !state.layers.syncing,
    !state.reports.synced && !state.reports.syncing,
    !state.feedback.synced.daily && !state.feedback.syncing.daily,
    !state.feedback.synced.weekly && !state.feedback.syncing.weekly
  ];
  const actionsPendingCount = actionsPending.reduce((ac, next) => (next ? ac + 1 : ac), 0);

  let pendingDataCount = 0;
  Object.keys(state).forEach((key) => {
    if (state[key].pendingData) {
      pendingDataCount += getActionsTodoCount(state[key].pendingData);
    }
  });
  return actionsPendingCount + pendingDataCount;
}

export function getTotalActionsInProgessCount(state) {
  const actionsInProgress = [
    !state.areas.synced && state.areas.syncing,
    !state.user.synced && state.user.syncing,
    !state.layers.synced && state.layers.syncing,
    !state.reports.synced && state.reports.syncing,
    !state.feedback.synced.daily && state.feedback.syncing.daily,
    !state.feedback.synced.weekly && state.feedback.syncing.weekly
  ];
  const actionsInProgressCount = actionsInProgress.reduce((ac, next) => (next ? ac + 1 : ac), 0);

  let pendingDataCount = 0;
  Object.keys(state).forEach((key) => {
    if (state[key].pendingData) {
      pendingDataCount += getActionsInProgessCount(state[key].pendingData);
    }
  });
  return actionsInProgressCount + pendingDataCount;
}

export function getTotalActionsPending(pendingData) {
  return getTotalActionsTodoCount(pendingData) + getTotalActionsInProgessCount(pendingData);
}

export function isSyncFinished(pendingData) {
  return (getTotalActionsPending(pendingData)) === 0;
}

export default { getTotalActionsPending };
