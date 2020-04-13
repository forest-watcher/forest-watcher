// @flow

import Papa from 'papaparse';
import type { Alert } from 'types/alerts.types';

const csvParseConfig = {
  header: true,
  dynamicTyping: true
};

export function parseAlerts(alertsCsv: string): Array<Alert> {
  return Papa.parse(alertsCsv, csvParseConfig)?.data || [];
}
