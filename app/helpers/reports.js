// @flow

import i18n from 'i18next';
import type { AlertDatasetConfig } from 'types/alerts.types';
import { DATASETS, DATASET_CATEGORIES } from 'config/constants';

// Using a full regex match for the end of the report name here including data so if user names there area something like SAMS-WIGGLY-REPORT
// it doesn't intefere with our logic.
const reportNameRegex = /-([A-Z|]+)-REPORT--\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d/;

/**
 * Gets the alert datasets that were selected when creating the report from the report name
 * @param {string} reportName - The report name to get the datasets from
 * @return {Object[]} An array of datasets that were selected when creating the report
 */
export function datasetsForReportName(reportName: string): $ReadOnlyArray<AlertDatasetConfig> {
  if (!reportName) {
    return [];
  }
  const result = reportName.match(reportNameRegex);
  if (!result || result.length < 2) {
    return [];
  }
  // Split the match for alert types by the seperator (|)
  const nameIds = result[1].split('|');
  // Match the alert types reported with DATASETS constant
  return Object.values(DATASETS).filter(dataset => nameIds.includes(dataset.reportNameId));
}

/**
 * Converts a report name, to a readable, localised string
 * @param {string} reportName - The report name to convert
 * @param {boolean} fallback - Whether to fallback to another string if no alert types could be found
 * @return {string} A localised, readable version of the string
 */
export function readableNameForReportName(reportName: string, fallback: boolean): ?string {
  if (!reportName) {
    // GFW-778: Fix for empty report names
    return fallback ? i18n.t('report.custom') : null;
  }
  const datasets = datasetsForReportName(reportName);
  if (datasets.length === 0) {
    return fallback ? reportName : null;
  }
  // See if report was for deforestation or fire alerts (Or both)
  const reportContainsDeforestationAlerts = datasets.find(dataset =>
    DATASET_CATEGORIES.deforestation.datasetSlugs.includes(dataset.id)
  );
  const reportContainsFireAlerts = datasets.find(dataset => DATASET_CATEGORIES.fires.datasetSlugs.includes(dataset.id));

  // Map dataset ids to readable names
  const datasetNames = datasets.map(dataset => i18n.t(`report.alertType.${dataset.id}`));
  const alertTypes = datasetNames.sort().join(', ');
  if (reportContainsDeforestationAlerts && reportContainsFireAlerts) {
    return i18n.t('report.deforestationAndFires', {
      alertTypes
    });
  } else if (reportContainsDeforestationAlerts) {
    return i18n.t('report.deforestation', {
      alertTypes
    });
  } else if (reportContainsFireAlerts) {
    return i18n.t('report.fires');
  } else {
    return fallback ? i18n.t('report.custom') : null;
  }
}
