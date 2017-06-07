
export function getReadyState(state) {
  return state.areas.synced && state.user.synced && state.reports.synced && state.feedback.dailySynced && state.feedback.weeklySynced;
}

export default { getReadyState };
