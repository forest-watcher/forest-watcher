
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
  return actionsPending.reduce((ac, next) => (next ? ac + 1 : ac), 0);
}

export default { getReadyState, getActionsPending };
