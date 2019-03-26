// @flow
import type { State } from 'types/store.types';
import type { Report } from 'types/reports.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { showNotConnectedNotification } from 'redux-modules/app';
import { saveReport, uploadReport, deleteReport, setReportAnswer } from 'redux-modules/reports';
import { setActiveAlerts } from 'redux-modules/alerts';

import { REPORTS } from 'config/constants';
import i18n from 'locales';
import moment from 'moment';

import { shouldBeConnected } from 'helpers/app';
import { getTemplate, mapFormToAnsweredQuestions } from 'helpers/forms';
import Answers from 'components/form/answers';

function mapReportToMetadata(report: Report, language) {
  if (!report) return [];

  const {
    area: { dataset = {} }
  } = report;
  const reportedPosition =
    report.clickedPosition &&
    JSON.parse(report.clickedPosition).map(pos =>
      [
        pos.lat.toLocaleString(undefined, { maximumFractionDigits: 4 }),
        pos.lon.toLocaleString(undefined, { maximumFractionDigits: 4 })
      ].toString()
    );
  const date = moment(report.date).format('YYYY-MM-DD');
  const userPosition =
    report.userPosition === REPORTS.noGpsPosition ? i18n.t('report.noGpsPosition') : report.userPosition;
  const metadata = [
    { id: 'name', label: i18n.t('commonText.name'), value: [report.reportName] },
    { id: 'areaName', label: i18n.t('commonText.area'), value: [report.area.name] },
    { id: 'date', label: i18n.t('commonText.date'), value: [date] },
    { id: 'language', label: i18n.t('commonText.language'), value: [language] },
    { id: 'userPosition', label: i18n.t('commonText.userPosition'), value: [userPosition] },
    { id: 'clickedPosition', label: i18n.t('commonText.reportedPosition'), value: [reportedPosition] }
  ];

  if (dataset && dataset.slug) {
    metadata.push({ id: 'dataset', label: i18n.t('commonText.alert'), value: [i18n.t(`datasets.${dataset.slug}`)] });
  }

  return metadata;
}

function mapStateToProps(state: State, ownProps: { reportName: string, readOnly: boolean }) {
  const { reportName, readOnly } = ownProps;
  const { reports, app } = state;
  const template = getTemplate(reports, reportName);
  const templateLang = template.languages.includes(app.language) ? app.language : template.defaultLanguage;
  const report = reports.list[reportName];
  const answers = report && report.answers;
  return {
    results: mapFormToAnsweredQuestions(answers, template, state.app.language),
    metadata: mapReportToMetadata(report, templateLang),
    isConnected: shouldBeConnected(state),
    report,
    readOnly
  };
}

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      saveReport,
      deleteReport,
      uploadReport,
      setReportAnswer,
      setActiveAlerts,
      showNotConnectedNotification
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Answers);
