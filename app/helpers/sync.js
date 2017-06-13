
export function getReadyState(state) {
  return state.areas.synced && state.user.synced &&
    state.reports.synced && state.feedback.synced.daily && state.feedback.synced.weekly;
}

// loop through the pending data object looking for actions that hasn't been dispatched yet
// return the num of actions to be dispatched
export function getActionsPendingCount(pendingData) {
  if (!pendingData || typeof pendingData !== 'object') return null;
  return Object.keys(pendingData).reduce((acc, next) => (
    acc + Object.keys(pendingData[next]).reduce((acc2, action) => (
      // true means the action is being done
      // so we don't have to sum it;
      acc2 + (pendingData[next][action] ? 0 : 1)
    ), 0)
  ), 0);
}

export function hasActionsPending(pendingData) {
  return getActionsPendingCount(pendingData) > 0;
}

export function getTotalActionsPending(state) {
  const actionsPending = [
    !state.areas.synced && !state.areas.syncing, // TODO CHECK AREA DATA TOO
    !state.user.synced && !state.user.syncing,
    !state.reports.synced && !state.reports.syncing,
    !state.feedback.synced.daily && !state.feedback.syncing.daily,
    !state.feedback.synced.weekly && !state.feedback.syncing.weekly
  ];
  const actionsPendingCount = actionsPending.reduce((ac, next) => (next ? ac + 1 : ac), 0);

  const { pendingData } = state.areas;
  const areasDataPendingCount = getActionsPendingCount(pendingData);

  return actionsPendingCount + areasDataPendingCount;
}

export default { getReadyState, getTotalActionsPending };
