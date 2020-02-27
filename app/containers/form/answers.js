// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

import { showNotConnectedNotification, showExportReportsSuccessfulNotification } from 'redux-modules/app';
import { saveReport, uploadReport, deleteReport, setReportAnswer } from 'redux-modules/reports';
import { setActiveAlerts } from 'redux-modules/alerts';

import { shouldBeConnected } from 'helpers/app';
import { getTemplate, mapFormToAnsweredQuestions, mapReportToMetadata } from 'helpers/forms';
import exportReports from 'helpers/exportReports';
import Answers from 'components/form/answers';

function mapStateToProps(state: State, ownProps: { reportName: string, readOnly: boolean }) {
  const { reportName, readOnly } = ownProps;
  const { reports, app } = state;
  const template = getTemplate(reports, reportName);
  const templateLang = template.languages.includes(app.language) ? app.language : template.defaultLanguage;
  const report = reports.list[reportName];
  const answers = report && report.answers;

  return {
    exportReport: async () =>
      await exportReports(
        [report],
        { [report?.area?.templateId]: template },
        templateLang,
        Platform.select({
          android: RNFetchBlob.fs.dirs.DownloadDir,
          ios: RNFetchBlob.fs.dirs.DocumentDir
        })
      ),
    results: mapFormToAnsweredQuestions(answers, template, state.app.language),
    metadata: mapReportToMetadata(report, templateLang),
    isConnected: shouldBeConnected(state),
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
      showNotConnectedNotification,
      showExportReportsSuccessfulNotification
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Answers);
