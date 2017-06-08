
export function getReadyState(state) {
  return state.areas.synced && state.user.synced &&
    state.reports.synced && state.feedback.synced.daily && state.feedback.synced.weekly;
}

export function getActionsPending(state) {
  const actionsPending = [
    !state.areas.synced && !state.areas.syncing, // TODO CHECK AREA DATA TOO
    !state.user.synced && !state.user.syncing,
    !state.reports.synced && !state.reports.syncing,
    !state.feedback.synced.daily && !state.feedback.syncing.daily,
    !state.feedback.synced.weekly && !state.feedback.syncing.weekly
  ];
  const actionsPendingCount = actionsPending.reduce((ac, next) => (next ? ac + 1 : ac), 0);

  const { pendingData } = state.areas;
  const areasDataPendingCount = Object.keys(pendingData).reduce((acc, next) => (
    acc + Object.keys(pendingData[next]).length
  ), 0);
  // yes... I know
  return actionsPendingCount + areasDataPendingCount;
}

export default { getReadyState, getActionsPending };
