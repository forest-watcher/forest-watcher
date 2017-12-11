import { STATUS } from 'config/constants/index';

export function isUnsafeLogout({ reports }) {
  const { list } = reports;
  const hasReportsToUpload = type => (type === STATUS.complete) || (type === STATUS.draft);
  return Object.values(list)
    .map(report => report.status)
    .some(hasReportsToUpload);
}

export default { isUnsafeLogout };
