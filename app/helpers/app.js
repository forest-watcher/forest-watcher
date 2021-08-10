// @flow
import type { State } from 'types/store.types';
import type { Report } from 'types/reports.types';

import { STATUS, LAST_WHATS_NEW_VERSION } from 'config/constants/index';

// $FlowFixMe
import { version } from 'package.json';

export function isUnsafeLogout(state: State): boolean {
  const { list } = state.reports;
  const hasReportsToUpload = (type: string) => type === STATUS.complete || type === STATUS.draft;
  return Object.keys(list)
    .map((key: string) => list[key])
    .map((report: Report) => report.status)
    .some(hasReportsToUpload);
}

export function shouldBeConnected(state: State): boolean {
  const { offline, app } = state;
  return offline.online && !app.offlineMode;
}

export function getVersionName(): string {
  return `v${version}`;
}

export function hasSeenLatestWhatsNewOrWelcomeScreen(state: State): boolean {
  const { welcomeSeenVersion } = state.app;
  if (!welcomeSeenVersion) {
    return false;
  }
  return welcomeSeenVersion >= LAST_WHATS_NEW_VERSION;
}
